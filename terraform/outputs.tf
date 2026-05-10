output "website_url" {
  description = "The Website's URL"
  value       = "https://${var.domain_name}"
}

output "frontend_bucket_name" {
  description = "The name of the S3 bucket hosting the frontend"
  value       = aws_s3_bucket.frontend_bucket.bucket
}

output "cloudfront_distribution_domain" {
  description = "The domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.cdn.domain_name
}

output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.cdn.id
}

output "api_gateway_url" {
  description = "The URL of the API Gateway"
  value       = aws_apigatewayv2_stage.default_stage.invoke_url
}

output "host_name" {
  description = "The host name for the API Gateway"
  value       = local.host_name
}

# Outputs from Neon
output "neon_project_id" {
  value = neon_project.main.id
}

output "neon_project_connection_uri" {
  description = "Default connection URI for db primary branch (SENSITIVE)"
  value       = neon_project.main.connection_uri
  sensitive   = true
}

output "neon_project_main_branch_id" {
  value = neon_branch.main_branch.id
}

output "neon_project_db_user" {
  value = neon_role.neon_db_admin_role.name
}

output "neon_user_password" {
  value     = neon_role.neon_db_admin_role.password
  sensitive = true
}
