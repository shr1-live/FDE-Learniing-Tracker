// The DevOps study program, built from the programme document: 5 weeks, 30 days (week 5 is the capstone).
// The day-by-day split is ours, the document only lists weeks: check it. Each day has the topics, the task and its resources;
// the three "done" points are generic and every day's proof is judged by the reviewer. Notes live in notesW1..notesW4.
export type DevopsDay = { n: number; title: string; topics: string[]; task: string; resources: string; done: string[] };
export type DevopsWeek = { n: number; title: string; days: DevopsDay[] };

export const DEVOPS_WEEKS: DevopsWeek[] = [
 {
  "n": 1,
  "title": "Linux, Bash, networking and NGINX",
  "days": [
   {
    "n": 1,
    "title": "Linux filesystem, users and permissions",
    "topics": [
     "Linux (Ubuntu): filesystem hierarchy standard (/etc, /var, /proc, /sys)",
     "User and group permissions (chmod, chown, sudoers)",
     "KodeKloud DevOps Pre-Requisite course: Linux Basics labs (skip basic Git/YAML lessons)"
    ],
    "task": "KodeKloud DevOps Pre-Requisite Course: complete the Linux Basics labs, skipping the basic Git and YAML lessons. In the KodeKloud Linux Playground, practise reading the filesystem layout and setting users, groups and permissions.",
    "resources": "KodeKloud: The Linux Basics course (https://app.kodekloud.com/learn/course/the-linux-basics-course/syllabus). Week 1 deliverable: a hardened Linux VM running NGINX with TLS proxying a backend API, supported by an automated maintenance Bash script. About 10 to 12 hours this week.",
    "done": [
     "Task finished: KodeKloud DevOps Pre-Requisite Course: complete the Linux Basics labs, skipping the basic Git and YAML lessons.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 2,
    "title": "Processes, services, packages and SSH hardening",
    "topics": [
     "Process lifecycle (systemd, systemctl, journalctl)",
     "Package maintenance via apt",
     "Resource diagnostics (htop, vmstat, iostat, df)",
     "SSH hardening"
    ],
    "task": "In the KodeKloud Linux Playground, manage a service with systemd (start, enable, read its logs with journalctl), update packages with apt, check CPU, memory, disk and I/O with the diagnostic tools, and apply baseline SSH hardening.",
    "resources": "",
    "done": [
     "Task finished: In the KodeKloud Linux Playground, manage a service with systemd (start, enable, read its logs with journalctl), update packages with apt, check CPU, memory, di",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 3,
    "title": "Bash scripting: defensive scripts and flow control",
    "topics": [
     "Defensive scripting (set -euo pipefail)",
     "Exit code handling",
     "Flow control and functions (Shell Scripts for Beginners labs)",
     "Standard pipes and redirection"
    ],
    "task": "KodeKloud Shell Scripts for Beginners: complete all flow control, exit codes and functions labs. Write a small script that uses set -euo pipefail, checks exit codes and redirects output to a log file.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud Shell Scripts for Beginners: complete all flow control, exit codes and functions labs.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 4,
    "title": "Bash scripting: text processing and cron",
    "topics": [
     "Text processing (grep, awk, sed, jq)",
     "Streams and redirection (Advanced Bash Scripting modules)",
     "Cron jobs",
     "The e-commerce project labs from Shell Scripts for Beginners"
    ],
    "task": "KodeKloud Shell Scripts for Beginners and Advanced Bash Scripting: complete the e-commerce project labs and the selected modules on awk, sed and streams. Schedule one of your scripts with cron.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud Shell Scripts for Beginners and Advanced Bash Scripting: complete the e-commerce project labs and the selected modules on awk, sed and streams.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 5,
    "title": "Networking: TCP/IP, DNS and TLS",
    "topics": [
     "TCP/IP stack",
     "DNS lookup and record resolution (dig, nslookup)",
     "Subnets and CIDR",
     "HTTP/HTTPS communication and TLS handshakes"
    ],
    "task": "KodeKloud DevOps Pre-Requisite Course: complete the Networking Basics labs and the Demystifying DNS course. Use dig and nslookup to resolve records and work out the subnet range for a given CIDR block.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud DevOps Pre-Requisite Course: complete the Networking Basics labs and the Demystifying DNS course.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 6,
    "title": "Firewalls and network diagnostics",
    "topics": [
     "Host firewalls (ufw, iptables)",
     "Diagnostic utilities: curl -v, ss, traceroute, tcpdump"
    ],
    "task": "In the KodeKloud Linux Playground, allow only the ports you need with ufw, then use curl -v, ss, traceroute and tcpdump to follow a request and find where a connection fails.",
    "resources": "",
    "done": [
     "Task finished: In the KodeKloud Linux Playground, allow only the ports you need with ufw, then use curl -v, ss, traceroute and tcpdump to follow a request and find where a con",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 7,
    "title": "NGINX and the Week 1 milestone lab",
    "topics": [
     "NGINX: reverse proxy architecture",
     "Upstream load balancing algorithms",
     "SSL/TLS termination",
     "Location routing and rate limiting",
     "Debugging 502 and 504 errors"
    ],
    "task": "Week 1 milestone lab. In the KodeKloud Ubuntu Playground, execute baseline SSH hardening, deploy a sample backend service managed by systemd, put NGINX in front as a TLS-terminating reverse proxy, and write an idempotent Bash script for health-checks and log-rotation.",
    "resources": "",
    "done": [
     "Task finished: Week 1 milestone lab.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   }
  ]
 },
 {
  "n": 2,
  "title": "Docker and Compose",
  "days": [
   {
    "n": 1,
    "title": "Docker basics and image layers",
    "topics": [
     "Docker course for the absolute beginner: containers, images and the hands-on labs",
     "Union filesystems",
     "Image layer caching optimization"
    ],
    "task": "KodeKloud Docker Training Course for the Absolute Beginner: fast-track at 1.5x to 2x speed and complete all hands-on container labs.",
    "resources": "KodeKloud: Docker Training Course for the Absolute Beginner, Docker Certified Associate (DCA) labs. Week 2 deliverable: a production-grade Dockerized multi-tier application stack running behind an NGINX proxy via Docker Compose. About 10 to 12 hours this week.",
    "done": [
     "Task finished: KodeKloud Docker Training Course for the Absolute Beginner: fast-track at 1.5x to 2x speed and complete all hands-on container labs.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 2,
    "title": "Production Dockerfiles",
    "topics": [
     "Multi-stage builds",
     "Minimal base images (Alpine or Distroless)",
     "Running as a non-root user",
     "The .dockerignore file"
    ],
    "task": "Write a production Dockerfile for a small service: multi-stage build, a minimal base image, a non-root user and a .dockerignore. Compare the image size before and after.",
    "resources": "",
    "done": [
     "Task finished: Write a production Dockerfile for a small service: multi-stage build, a minimal base image, a non-root user and a .dockerignore.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 3,
    "title": "Container networking and volumes",
    "topics": [
     "Bridge and host container networking",
     "Volume persistence",
     "Storage drivers (DCA labs)"
    ],
    "task": "KodeKloud Docker course and DCA labs: complete the networking and volume labs, then the selected labs on storage drivers.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud Docker course and DCA labs: complete the networking and volume labs, then the selected labs on storage drivers.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 4,
    "title": "Image optimization and container security",
    "topics": [
     "Multi-stage builds and image optimization (DCA labs)",
     "Container security (DCA labs)"
    ],
    "task": "KodeKloud Docker Certified Associate (DCA): complete the selected deep-dive labs on multi-stage builds, image optimization and container security.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud Docker Certified Associate (DCA): complete the selected deep-dive labs on multi-stage builds, image optimization and container security.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 5,
    "title": "Docker Compose: multi-container stacks",
    "topics": [
     "Declarative multi-container stack composition (docker-compose.yml)",
     "Internal DNS service discovery between containers",
     "The Compose labs from the Docker beginner course"
    ],
    "task": "KodeKloud Docker course: complete the Compose labs. Write a docker-compose.yml with two services that find each other by name.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud Docker course: complete the Compose labs.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 6,
    "title": "Compose: health checks and configuration",
    "topics": [
     "Dependency chains with runtime health checks (depends_on with condition: service_healthy)",
     "Environment variable injection hierarchy"
    ],
    "task": "Extend your Compose file so the API waits for a healthy database (depends_on with condition: service_healthy), and test how values from .env files, the environment and the Compose file override each other.",
    "resources": "",
    "done": [
     "Task finished: Extend your Compose file so the API waits for a healthy database (depends_on with condition: service_healthy), and test how values from .env files, the environm",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 7,
    "title": "Week 2 milestone lab: a multi-tier stack",
    "topics": [
     "Multi-tier architecture: frontend, API server, relational database and Redis cache",
     "Optimized multi-stage Dockerfiles for every tier",
     "NGINX reverse proxy in front of the stack with Docker Compose",
     "Explicit service dependency health checks and persistent storage volumes"
    ],
    "task": "Week 2 milestone lab. Containerize a multi-tier application architecture (frontend, API server, relational database, Redis cache) using optimized multi-stage Dockerfiles. Run the complete stack behind an NGINX reverse proxy managed via Docker Compose with explicit service dependency health checks and persistent storage volumes.",
    "resources": "",
    "done": [
     "Task finished: Week 2 milestone lab.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   }
  ]
 },
 {
  "n": 3,
  "title": "CI/CD, cloud and Terraform",
  "days": [
   {
    "n": 1,
    "title": "CI/CD pipelines: workflows and builds",
    "topics": [
     "GitHub Actions / Azure DevOps: workflow syntax",
     "Event-driven pipelines",
     "Parallel matrix builds",
     "Build artifact caching"
    ],
    "task": "KodeKloud GitHub Actions or Azure DevOps labs: complete the workflow syntax and matrix build labs. Build a workflow that runs tests in parallel across a matrix and caches its dependencies.",
    "resources": "KodeKloud: GitHub Actions or Azure DevOps labs, AWS Cloud Practitioner / AWS IAM or AZ-104 labs, Terraform Basics Training Course, Cloud Playgrounds. Week 3 deliverable: an automated Terraform codebase provisioning cloud infrastructure, plus a CI/CD pipeline that builds and deploys containers via OIDC. About 10 to 12 hours this week.",
    "done": [
     "Task finished: KodeKloud GitHub Actions or Azure DevOps labs: complete the workflow syntax and matrix build labs.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 2,
    "title": "CI/CD pipelines: secrets, OIDC and releases",
    "topics": [
     "OpenID Connect (OIDC) keyless cloud authentication",
     "Secrets management",
     "Container build and push actions, registry pushes",
     "Vulnerability scanning",
     "Release strategies"
    ],
    "task": "KodeKloud GitHub Actions or Azure DevOps labs: complete the federated identity (OIDC), secrets management and container build/push labs. Add an image vulnerability scan to your workflow.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud GitHub Actions or Azure DevOps labs: complete the federated identity (OIDC), secrets management and container build/push labs.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 3,
    "title": "Cloud foundations: identity and access",
    "topics": [
     "IAM roles and least privilege policies",
     "AWS IAM or Entra ID basics",
     "The AWS Cloud Practitioner or AZ-104 IAM labs"
    ],
    "task": "KodeKloud AWS Cloud Practitioner / AWS IAM or AZ-104 Azure Administrator: fast-track the IAM or Entra ID labs in the AWS or Azure Playground. Create a role with a least-privilege policy.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud AWS Cloud Practitioner / AWS IAM or AZ-104 Azure Administrator: fast-track the IAM or Entra ID labs in the AWS or Azure Playground.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 4,
    "title": "Cloud foundations: networking",
    "topics": [
     "VPC/VNet layout",
     "Public and private subnets",
     "NAT Gateways",
     "Security Groups and NSGs"
    ],
    "task": "KodeKloud AWS or Azure Playground: build a VPC or VNet with a public and a private subnet, a NAT Gateway and a security group, following the course labs.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud AWS or Azure Playground: build a VPC or VNet with a public and a private subnet, a NAT Gateway and a security group, following the course labs.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 5,
    "title": "Cloud foundations: compute, storage and monitoring",
    "topics": [
     "Compute runtimes (EC2 or virtual machines)",
     "Managed storage (S3 or Blob Storage)",
     "Container registries (ECR or ACR)",
     "CloudWatch and Azure Monitor"
    ],
    "task": "KodeKloud AWS or Azure Playground: complete the EC2/VM, S3/Blob Storage and ECR/ACR labs, and look at the metrics and logs in CloudWatch or Azure Monitor.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud AWS or Azure Playground: complete the EC2/VM, S3/Blob Storage and ECR/ACR labs, and look at the metrics and logs in CloudWatch or Azure Monitor.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 6,
    "title": "Terraform: HCL, variables and state",
    "topics": [
     "Declarative HCL",
     "Variables",
     "State lifecycle (terraform.tfstate)",
     "Remote state with locking (S3 + DynamoDB or Azure Storage)"
    ],
    "task": "KodeKloud Terraform Basics Training Course: complete the HCL, state management, remote backend locking and variables labs.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud Terraform Basics Training Course: complete the HCL, state management, remote backend locking and variables labs.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 7,
    "title": "Terraform modules and the Week 3 milestone lab",
    "topics": [
     "Reusable module design",
     "Plan and apply CI automation",
     "Provisioning a VPC/VNet, IAM roles and a container registry",
     "A CI/CD pipeline that tests, builds, scans and pushes an image with OIDC"
    ],
    "task": "Week 3 milestone lab. Using KodeKloud's Cloud Playground, write modular Terraform configurations with a remote state backend to provision a VPC/VNet, IAM roles, and a container registry. Construct a CI/CD pipeline in GitHub Actions or Azure DevOps that automatically tests, builds, scans, and pushes the container image via OIDC keyless authentication.",
    "resources": "",
    "done": [
     "Task finished: Week 3 milestone lab.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   }
  ]
 },
 {
  "n": 4,
  "title": "Kubernetes and Helm",
  "days": [
   {
    "n": 1,
    "title": "Kubernetes architecture and workloads",
    "topics": [
     "Control plane vs worker nodes",
     "Pods",
     "Deployments, StatefulSets, DaemonSets and Jobs",
     "Kubernetes for the Absolute Beginners: foundational labs"
    ],
    "task": "KodeKloud Kubernetes for the Absolute Beginners: fast-track the foundational architecture and core concept labs.",
    "resources": "KodeKloud: Kubernetes for the Absolute Beginners, CKAD / CKA certification courses, Helm for Beginners, Kubernetes Playground. Week 4 deliverable: an end-to-end automated deployment of a custom Helm-packaged application onto a Kubernetes cluster via CI/CD. About 12 to 14 hours this week.",
    "done": [
     "Task finished: KodeKloud Kubernetes for the Absolute Beginners: fast-track the foundational architecture and core concept labs.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 2,
    "title": "Kubernetes: configuration and traffic",
    "topics": [
     "ConfigMaps and Secrets",
     "Services",
     "Ingress controllers"
    ],
    "task": "KodeKloud CKAD / CKA courses: complete the labs on Services, Ingress, ConfigMaps and Secrets.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud CKAD / CKA courses: complete the labs on Services, Ingress, ConfigMaps and Secrets.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 3,
    "title": "Kubernetes: storage and network policy",
    "topics": [
     "PV, PVC and StorageClasses",
     "NetworkPolicies"
    ],
    "task": "KodeKloud CKAD / CKA courses: complete the labs on PV/PVC and NetworkPolicies.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud CKAD / CKA courses: complete the labs on PV/PVC and NetworkPolicies.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 4,
    "title": "Kubernetes: scaling and health",
    "topics": [
     "Horizontal Pod Autoscaler (HPA)",
     "Resource requests and limits",
     "Health probes"
    ],
    "task": "KodeKloud CKAD / CKA courses: complete the labs on HPA, resource limits and probes.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud CKAD / CKA courses: complete the labs on HPA, resource limits and probes.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 5,
    "title": "Kubernetes troubleshooting",
    "topics": [
     "kubectl debugging",
     "CrashLoopBackOff",
     "ImagePullBackOff",
     "Cluster troubleshooting (CKAD/CKA labs)"
    ],
    "task": "KodeKloud CKAD / CKA courses: complete the cluster troubleshooting labs. Break a deployment on purpose in the Kubernetes Playground and fix it using kubectl.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud CKAD / CKA courses: complete the cluster troubleshooting labs.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 6,
    "title": "Helm: charts and templates",
    "topics": [
     "Chart structure (Chart.yaml, values.yaml, templates/)",
     "Go templating",
     "The chart anatomy labs from Helm for Beginners"
    ],
    "task": "KodeKloud Helm for Beginners: complete the labs on chart anatomy, Go templating and values.yaml overrides.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud Helm for Beginners: complete the labs on chart anatomy, Go templating and values.yaml overrides.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 7,
    "title": "Helm: environments and releases",
    "topics": [
     "Environment overrides (values-dev.yaml, values-prod.yaml)",
     "Release operations: helm install, upgrade and rollback",
     "Third-party charts (ingress-nginx, cert-manager)"
    ],
    "task": "KodeKloud Helm for Beginners: complete the release upgrade and rollback labs. Install ingress-nginx and cert-manager from their charts.",
    "resources": "",
    "done": [
     "Task finished: KodeKloud Helm for Beginners: complete the release upgrade and rollback labs.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   }
  ]
 },
 {
  "n": 5,
  "title": "Capstone",
  "days": [
   {
    "n": 1,
    "title": "Capstone, part 1: deploy to Kubernetes with Helm",
    "topics": [
     "Deploying a multi-service containerized application onto a multi-node Kubernetes cluster or an EKS/AKS sandbox",
     "Packaging the components into a custom Helm chart with environment-specific values"
    ],
    "task": "Week 4 capstone lab, part 1. Deploy the multi-service containerized application onto a KodeKloud multi-node Kubernetes cluster or managed EKS/AKS sandbox. Package components into a custom Helm chart using environment-specific values.",
    "resources": "The capstone from the Week 4 plan (days 29 and 30).",
    "done": [
     "Task finished: Week 4 capstone lab, part 1.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   },
   {
    "n": 2,
    "title": "Capstone, part 2: Ingress, HPA and CI/CD",
    "topics": [
     "Ingress routing for the application",
     "HPA rules",
     "Automated deployment through the CI/CD pipeline"
    ],
    "task": "Week 4 capstone lab, part 2. Add Ingress routing and HPA rules to your Helm chart, and deploy it automatically through the CI/CD pipeline.",
    "resources": "",
    "done": [
     "Task finished: Week 4 capstone lab, part 2.",
     "I can explain each topic of the day in my own words.",
     "Proof is saved: a screenshot, log, command output or link that shows it working."
    ]
   }
  ]
 }
];
