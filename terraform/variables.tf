variable "aws_region" {
  description = "The AWS region containing the stack"
  type        = string
  default     = "us-east-1"
}

variable "stack_name" {
  description = "The name of the stack"
  type        = string
  default     = "personal-website-stack"
}

variable "domain_name" {
  description = "The domain name for the website"
  type        = string
}

# variable "backend_function_image_uri" {
#   description = "The URI of the container image for the backend Lambda function"
#   type        = string
# }

variable "certificate_arn" {
  description = "The ARN of the SSL certificate for the website"
  type        = string
}

variable "nasa_api_key" {
  description = "API key for NASA API access"
  type        = string
  sensitive   = true
}

variable "next_public_base_url" {
  description = "The base URL for the frontend application"
  type        = string
}

variable "static_files_bucket_name" {
  description = "The name of the S3 bucket for hosting static files"
  type        = string
}

variable "environment" {
  description = "The deployment environment (e.g., dev, staging, prod)"
  type        = string
}

variable "neon_api_key" {
  description = "API key for Neon database access"
  type        = string
  sensitive   = true
}

# Variables for AWS RDS
# variable "db_username" {
#   description = "The username for the PostgreSQL database"
#   type        = string
#   sensitive   = true
# }

# variable "db_password" {
#   description = "The password for the PostgreSQL database"
#   type        = string
#   sensitive   = true
# }
