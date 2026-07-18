# Equipment Tracker — Cloud & DevOps Case Study

This fork documents the infrastructure, deployment, monitoring, and security work I did on top of an existing open-source application, as hands-on practice for a Cloud & DevOps Engineer role.

> **Attribution note:** The application itself (Django REST API + React frontend, offshore/onshore equipment tracking logic) is from an open-source practice repository by [davidoluwaseyi024-beep](https://github.com/davidoluwaseyi024-beep/offshore-onshore-Equipment-Tracker). Everything documented below — the infrastructure, CI/CD pipeline, monitoring, security hardening, and cost controls — is my own work, built and debugged from scratch on top of that codebase.

## What this project actually demonstrates

Not "I wrote this app." Instead: **given a real Django + React codebase, here's how I took it from source code to a monitored, secured, automatically-deployed production environment on AWS.**

## Architecture

- **Backend**: Django REST API on AWS Elastic Beanstalk (Python 3.13, Amazon Linux 2023)
- **Database**: PostgreSQL on Amazon RDS
- **Frontend**: React (Vite) static build hosted on Amazon S3
- **Region**: af-south-1 (Cape Town)

## What I built

### 1. Infrastructure deployment (AWS CLI, no console clicking)
- Provisioned RDS Postgres and an Elastic Beanstalk environment entirely via CLI
- Diagnosed and fixed a production SSL redirect loop caused by `SECURE_SSL_REDIRECT` conflicting with an HTTP-only load balancer listener
- Diagnosed and fixed a `DisallowedHost` error caused by the Elastic Beanstalk load balancer's own hostname not being covered by Django's `ALLOWED_HOSTS`
- Deployed the React frontend separately to S3 static hosting, with CORS configured between frontend and backend

### 2. CI/CD pipeline
- Built a GitHub Actions workflow: push to `main` → install dependencies → run Django deployment checks → deploy automatically to Elastic Beanstalk
- Solved real pipeline failures along the way, including:
  - Scoped IAM credentials for CI (separate from personal AWS credentials) with proper rotation after accidental exposure
  - A missing `.elasticbeanstalk/config.yml` in version control, which is required for the CI runner to know which environment to deploy to (this file has no secrets in it, so it's safe to commit)

### 3. Monitoring & observability (three layers)
- **Health**: Elastic Beanstalk Enhanced Health Reporting + a CloudWatch alarm wired to real email alerts via SNS
- **Logs**: Full CloudWatch Logs streaming enabled, queried directly with CloudWatch Logs Insights (no manual log downloads)
- **Application-level**: Custom Django middleware logging every request's path, method, status code, and duration in milliseconds — queryable the same way as infrastructure logs

### 4. Security
- Audited IAM least-privilege access and moved all secrets (DB credentials, Django secret key) out of code and into environment configuration
- Completed hands-on AWS security challenges ([flaws.cloud](http://flaws.cloud)) covering:
  - Public S3 bucket listing (obscure filenames aren't security)
  - "Any authenticated AWS user" permissions (means any AWS account, not just your organization's)
  - Secrets left behind in git commit history (deleting a file in a later commit doesn't erase it from history)

### 5. Cost discipline
- Set a real AWS Budget alert with email notification
- Tagged resources (`Project`, `Environment`) for cost allocation and traceability
- Practiced cross-checking cost data against multiple sources (Cost Explorer, Free Tier usage API, and the actual Bills page) rather than trusting a single dashboard number

## Lessons learned (the honest version)

- `eb setenv` triggers a config-deploy that can silently interact badly with build artifacts — always follow with `eb deploy`
- A `.py` settings file needs valid Python even for throwaway test edits — plain shell output like `date` breaks the build if appended directly
- Git Bash on Windows silently rewrites any argument starting with `/` into a Windows path — use `MSYS2_ARG_CONV_EXCL` to work around it for AWS CLI commands involving CloudWatch log group names
- Stopping RDS to save cost while resting will break any deploy relying on a database migration hook — worth remembering before triggering a CI run

## Next steps

- Custom domain + HTTPS via Route 53 and AWS Certificate Manager
- CloudFront in front of the S3 frontend (currently pending AWS account verification)
- Offline-first sync design for field-worker use cases in low-connectivity environments

---

*This README documents infrastructure and DevOps work completed as part of self-directed cloud engineering practice, in preparation for the NCDMB Digitalization Initiative capstone.*
