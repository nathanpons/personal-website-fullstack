terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.41.0"
    }
    neon = {
      source = "kislerdm/neon"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
  # # Potentially have to run terraform apply before uncommenting this remote backend
  # backend = {
  #   bucket         = "personal-website-terraform-state-bucket"
  #   key            = "terraform.tfstate"
  #   region         = var.aws_region
  #   dynamodb_table = aws_dynamodb_table.terraform_state_lock_table.name
  #   encrypt        = true
  # }

  required_version = ">= 1.2"
}

# Locals Values (!Sub)
# ---------------------------------------------------------------
locals {
  common_tags = {
    Project     = var.stack_name
    Environment = var.environment
    managed_by  = "Terraform"
  }
  availability_zone_letters = ["a", "b", "c", "d"]

  prefix = "${var.stack_name}-${var.environment}"

  raw_url   = aws_apigatewayv2_stage.default_stage.invoke_url
  host_name = replace(local.raw_url, "https://", "")
}

# Resources
# ---------------------------------------------------------------

# ## State bucket
# resource "aws_s3_bucket" "terraform_state_bucket" {
#   bucket        = "${local.prefix}-terraform-state-bucket"
#   force_destroy = true

#   tags = local.common_tags
# }

# resource "aws_s3_bucket_versioning" "terraform_state_bucket_versioning" {
#   bucket = aws_s3_bucket.terraform_state_bucket.id

#   versioning_configuration {
#     status = "Enabled"
#   }
# }

# ## DynamoDB Table for State Locking
# resource "aws_dynamodb_table" "terraform_state_lock_table" {
#   name         = "${local.prefix}-terraform-state-lock-table"
#   billing_mode = "PAY_PER_REQUEST"
#   hash_key     = "LockID"

#   attribute {
#     name = "LockID"
#     type = "S"
#   }

#   tags = local.common_tags
# }

## Frontend S3 Bucket
resource "aws_s3_bucket" "frontend_bucket" {
  bucket        = "${local.prefix}-frontend-bucket"
  force_destroy = true

  tags = local.common_tags
}

resource "aws_s3_bucket_versioning" "frontend_bucket_versioning" {
  bucket = aws_s3_bucket.frontend_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend_bucket_encryption" {
  bucket = aws_s3_bucket.frontend_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "frontend_bucket_public_access_block" {
  bucket = aws_s3_bucket.frontend_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "frontend_bucket_ownership_controls" {
  bucket = aws_s3_bucket.frontend_bucket.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

## Frontend S3 Bucket Policy
resource "aws_s3_bucket_policy" "frontend_bucket_policy" {
  bucket = aws_s3_bucket.frontend_bucket.id
  policy = jsonencode(
    {
      Version : "2012-10-17",
      Statement : [
        {
          Effect : "Allow",
          Principal : {
            Service : "cloudfront.amazonaws.com"
          },
          Action : "s3:GetObject",
          Resource : "${aws_s3_bucket.frontend_bucket.arn}/*",
          Condition : {
            StringEquals : {
              "AWS:SourceArn" : "${aws_cloudfront_distribution.cdn.arn}"
            }
          }
        }
      ]
    }
  )
}

## Static Files S3 Bucket (Already in place)
data "aws_s3_bucket" "static_files_bucket" {
  bucket = var.static_files_bucket_name
}

resource "aws_s3_bucket_versioning" "static_files_bucket_versioning" {
  bucket = data.aws_s3_bucket.static_files_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "static_files_bucket_encryption" {
  bucket = data.aws_s3_bucket.static_files_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "static_files_bucket_public_access_block" {
  bucket = data.aws_s3_bucket.static_files_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "static_files_bucket_ownership_controls" {
  bucket = data.aws_s3_bucket.static_files_bucket.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

## Static Files Bucket Policy
### TODO: AWS inside first principle needs LambdaEdgeRole.Arn
resource "aws_s3_bucket_policy" "static_files_bucket_policy" {
  bucket = data.aws_s3_bucket.static_files_bucket.id
  policy = jsonencode(
    {
      Version : "2012-10-17",
      Statement : [
        {
          Effect : "Allow",
          Principal : {
            AWS : aws_iam_role.lambda_execution_role.arn
          },
          Action : "s3:GetObject",
          Resource : "${data.aws_s3_bucket.static_files_bucket.arn}/*"
        },
        {
          Effect : "Allow",
          Principal : {
            Service : "cloudfront.amazonaws.com"
          },
          Action : "s3:GetObject",
          Resource : "${data.aws_s3_bucket.static_files_bucket.arn}/*",
          Condition : {
            StringEquals : {
              "AWS:SourceArn" : "${aws_cloudfront_distribution.cdn.arn}"
            }
          }
        }
      ]
    }
  )
}

## Lambda Roles
resource "aws_iam_role" "lambda_execution_role" {
  name = "${local.prefix}-lambda-execution-role"

  assume_role_policy = jsonencode(
    {
      Version : "2012-10-17",
      Statement : [
        {
          Effect : "Allow",
          Principal : {
            Service : "lambda.amazonaws.com"
          },
          Action : "sts:AssumeRole"
        }
      ]
  })

  tags = local.common_tags
}

resource "aws_iam_policy" "lambda_s3_read_access" {
  name        = "${local.prefix}-lambda-get-s3-policy"
  description = "IAM policy for Lambda function to get objects from S3 bucket"
  policy = jsonencode(
    {
      Version : "2012-10-17",
      Statement : [
        {
          Effect : "Allow",
          Action : "s3:GetObject",
          Resource : "${data.aws_s3_bucket.static_files_bucket.arn}/*"
        }
      ]
    }
  )
}

resource "aws_iam_role_policy_attachment" "lambda_s3_read_access_attachment" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.lambda_s3_read_access.arn
}

resource "aws_iam_role" "lambda_edge_role" {
  name = "${local.prefix}-lambda-edge-role"

  assume_role_policy = jsonencode(
    {
      Version : "2012-10-17",
      Statement : [
        {
          Effect : "Allow",
          Principal : {
            Service : [
              "lambda.amazonaws.com",
              "edgelambda.amazonaws.com"
            ]
          },
          Action : "sts:AssumeRole"
        }
      ]
  })

  tags = local.common_tags
}

## Origin Access Control
resource "aws_cloudfront_origin_access_control" "oac" {
  origin_access_control_origin_type = "s3"
  name                              = "${local.prefix}-oac"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ECR Repository for Lambda Edge Function
# ## TODO: Research IMMUTABLE and see if it is worth doing
# resource "aws_ecr_repository" "backend_repository" {
#   name                 = "${local.prefix}-backend-repository"
#   image_tag_mutability = "MUTABLE"
#   image_scanning_configuration {
#     scan_on_push = true
#   }

#   lifecycle {
#     prevent_destroy = true
#   }

#   tags = local.common_tags
# }

data "aws_ecr_repository" "backend_repository" {
  name = "${local.prefix}-backend-repository"
}

resource "aws_ecr_lifecycle_policy" "backend_repository_lifecycle_policy" {
  repository = data.aws_ecr_repository.backend_repository.name
  policy = jsonencode(
    {
      rules : [
        {
          rulePriority : 1,
          description : "Delete excess images",
          selection : {
            tagStatus : "any",
            countType : "imageCountMoreThan",
            countNumber : 2
          },
          action : {
            type : "expire"
          }
        }
      ]
    }
  )
}

## Cloudfront Distribution
resource "aws_cloudfront_distribution" "cdn" {
  origin {
    origin_id                = "frontend-origin"
    domain_name              = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id

    s3_origin_config {
      origin_access_identity = ""
    }
  }

  origin {
    origin_id   = "backend-origin"
    domain_name = "${aws_apigatewayv2_api.api_gateway.id}.execute-api.${var.aws_region}.amazonaws.com"
    # origin_path = var.environment

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  aliases             = [var.domain_name, "www.${var.domain_name}"]
  default_root_object = "index.html"
  enabled             = true

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = "frontend-origin"
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    lambda_function_association {
      event_type   = "viewer-request"
      include_body = false
      lambda_arn   = aws_lambda_function.www_redirect_function.qualified_arn
    }
  }

  ordered_cache_behavior {
    path_pattern             = "/api/*"
    target_origin_id         = "backend-origin"
    viewer_protocol_policy   = "redirect-to-https"
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  depends_on = [
    aws_apigatewayv2_api.api_gateway,
    aws_apigatewayv2_integration.lambda_integration,
    aws_apigatewayv2_stage.default_stage,
  ]
}

## AWS Lambda Backend
resource "aws_cloudwatch_log_group" "backend_function_log_group" {
  name              = "/aws/lambda/${local.prefix}-backend-function"
  retention_in_days = 14

  tags = local.common_tags
}

resource "aws_iam_policy" "lambda_logging" {
  name        = "${local.prefix}-lambda-logging-policy"
  description = "IAM policy for Lambda function logging to CloudWatch"
  policy = jsonencode(
    {
      Version : "2012-10-17",
      Statement : [
        {
          Effect : "Allow",
          Action : [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ],
          Resource : "arn:aws:logs:*:*:*"
        }
      ]
    }
  )
}

resource "aws_iam_role_policy_attachment" "backend_lambda_logs" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

data "aws_ecr_image" "latest_backend_image" {
  repository_name = data.aws_ecr_repository.backend_repository.name
  image_tag       = "latest"
}

resource "aws_lambda_function" "backend_function" {
  function_name = "${local.prefix}-backend-function"
  package_type  = "Image"
  image_uri     = "${data.aws_ecr_repository.backend_repository.repository_url}@${data.aws_ecr_image.latest_backend_image.image_digest}"
  timeout       = 30
  role          = aws_iam_role.lambda_execution_role.arn

  image_config {
    command = ["server.handler"]
  }

  logging_config {
    log_format            = "JSON"
    application_log_level = "INFO"
    system_log_level      = "WARN"
  }

  # TEMP REMOVE VPC CONFIG
  # vpc_config {
  #   subnet_ids         = [for subnet in aws_subnet.public_subnets : subnet.id]
  #   security_group_ids = [aws_security_group.lambda_security_group.id]
  # }

  environment {
    variables = {
      NASA_API_KEY                        = var.nasa_api_key
      BASE_URL                            = var.next_public_base_url
      NODE_ENV                            = var.environment
      AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1"
      STATIC_BUCKET_NAME                  = data.aws_s3_bucket.static_files_bucket.id
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.backend_lambda_logs,
  ]

  tags = local.common_tags
}

resource "aws_lambda_permission" "apigateway_lambda_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.backend_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api_gateway.execution_arn}/*/*"
}

## Www Redirect Function
resource "local_file" "www_redirect_function_template_file" {
  content  = templatefile("lambda_functions/www-redirect-function.js.tftpl", { target_domain = var.domain_name })
  filename = "lambda_functions/www-redirect-function.js"
}

resource "aws_cloudwatch_log_group" "www_redirect_function_log_group" {
  name              = "/aws/lambda/${local.prefix}-www-redirect-function"
  retention_in_days = 14

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "www_redirect_lambda_logs" {
  role       = aws_iam_role.lambda_edge_role.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}

data "archive_file" "www_redirect_function_zip" {
  type        = "zip"
  source_file = local_file.www_redirect_function_template_file.filename
  output_path = "lambda_functions/www-redirect-function.zip"
}

resource "aws_lambda_function" "www_redirect_function" {
  provider         = aws.us_east_1
  function_name    = "${local.prefix}-www-redirect-function"
  role             = aws_iam_role.lambda_edge_role.arn
  runtime          = "nodejs24.x"
  handler          = "www-redirect-function.handler"
  timeout          = 5
  filename         = data.archive_file.www_redirect_function_zip.output_path
  source_code_hash = data.archive_file.www_redirect_function_zip.output_base64sha256
  publish          = true

  tags = local.common_tags
}

resource "aws_lambda_alias" "www_redirect_function_alias" {
  name             = "live"
  provider         = aws.us_east_1
  function_name    = aws_lambda_function.www_redirect_function.function_name
  function_version = aws_lambda_function.www_redirect_function.version
}

## API Gateway
resource "aws_apigatewayv2_api" "api_gateway" {
  name          = "${local.prefix}-api-gateway"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [
      "https://${var.domain_name}",
      "https://www.${var.domain_name}",
      "https://nasa.gov",
      "https://api.nasa.gov",
      "https://apod.nasa.gov",
    ]
    # allow_origins = ["*"]
    allow_headers = ["content-type", "authorization", "x-amz-date", "x-api-key"]
  }

  tags = local.common_tags
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.api_gateway.id
  integration_type = "AWS_PROXY"

  integration_method = "POST"
  integration_uri    = aws_lambda_function.backend_function.invoke_arn
}

resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.api_gateway.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.api_gateway.id
  name        = "$default"
  auto_deploy = true
}

## Postgres Database
# resource "aws_db_instance" "postgres_db" {
#   allocated_storage   = 20
#   storage_type        = "gp3"
#   engine              = "postgres"
#   engine_version      = "15"
#   instance_class      = "db.t3.micro"
#   db_name             = replace("${local.prefix}-db", "-", "_")
#   username            = var.db_username
#   password            = var.db_password
#   deletion_protection = true

#   db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
#   vpc_security_group_ids = [aws_security_group.rds_security_group.id]

#   tags = local.common_tags
# }

## Neon Postgres Database to replace Postgres Database (using free tier)
# resource "neon_project" "main" {
#   name                      = "${local.prefix}-neon-db-project"
#   pg_version                = "17"
#   region_id                 = "aws-${var.aws_region}"
#   org_id                    = var.neon_org_id
#   history_retention_seconds = 21600 # 6 hours, max for free tier

#   lifecycle {
#     prevent_destroy = true
#   }
# }

# resource "neon_branch" "main_branch" {
#   project_id = neon_project.main.id
#   name       = "${local.prefix}-main-branch"
# }

# resource "neon_role" "neon_db_admin_role" {
#   project_id = neon_project.main.id
#   branch_id  = neon_branch.main_branch.id
#   name       = "${local.prefix}-neon-db-admin-role"
# }

# resource "neon_database" "main_db" {
#   project_id = neon_project.main.id
#   branch_id  = neon_branch.main_branch.id
#   name       = "${local.prefix}-neon-db"
#   owner_name = neon_role.neon_db_admin_role.name
# }

# resource "neon_endpoint" "main_endpoint" {
#   project_id = neon_project.main.id
#   branch_id  = neon_branch.main_branch.id
#   type       = "read_write"
# }

## VPC and Networking
resource "aws_vpc" "personal_website_vpc" {
  cidr_block = "10.0.0.0/16"

  tags = local.common_tags
}

# resource "aws_security_group" "rds_security_group" {
#   name        = "${local.prefix}-rds-security-group"
#   description = "Security group for postgres instance"
#   vpc_id      = aws_vpc.personal_website_vpc.id

#   ingress {
#     from_port       = 5432
#     to_port         = 5432
#     protocol        = "tcp"
#     security_groups = [aws_security_group.lambda_security_group.id]
#   }

#   egress {
#     from_port   = 53
#     to_port     = 53
#     protocol    = "udp"
#     cidr_blocks = ["0.0.0.0/0"] # Route 53 Resolver
#   }

#   egress {
#     from_port   = 53
#     to_port     = 53
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"] # Route 53 Resolver
#   }
# }

# resource "aws_vpc_security_group_egress_rule" "allow_https_outbound" {
#   security_group_id = aws_security_group.lambda_security_group.id
#   cidr_ipv4         = "0.0.0.0/0"
#   ip_protocol       = "tcp"
#   from_port         = 443
#   to_port           = 443
# }

resource "aws_security_group" "lambda_security_group" {
  name        = "${local.prefix}-lambda-security-group"
  description = "Security group for lambda functions"
  vpc_id      = aws_vpc.personal_website_vpc.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# resource "aws_db_subnet_group" "db_subnet_group" {
#   name       = "${local.prefix}-db-subnet-group"
#   subnet_ids = [for subnet in aws_subnet.private_subnets : subnet.id]

#   tags = local.common_tags
# }

resource "aws_subnet" "public_subnets" {
  count                   = 1
  vpc_id                  = aws_vpc.personal_website_vpc.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = "${var.aws_region}${local.availability_zone_letters[count.index]}"
  map_public_ip_on_launch = true

  tags = merge(local.common_tags, {
    Name = "${local.prefix}-public-subnet-${count.index + 1}"
  })
}

# resource "aws_subnet" "private_subnets" {
#   count             = 2 # Need at least 2 private subnets for RDS Multi-AZ deployment, even if we aren't using Multi-AZ right now. This allows for easier future scaling and better availability.
#   vpc_id            = aws_vpc.personal_website_vpc.id
#   cidr_block        = "10.0.${count.index + 10}.0/24" # Start private subnets at .10 to avoid overlap with public subnets
#   availability_zone = "${var.aws_region}${local.availability_zone_letters[count.index]}"

#   tags = merge(local.common_tags, {
#     Name = "${local.prefix}-private-subnet-${count.index + 1}"
#   })
# }

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.personal_website_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main_igw.id
  }
}

resource "aws_route_table_association" "public_route_table_association" {
  count          = length(aws_subnet.public_subnets)
  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_internet_gateway" "main_igw" {
  vpc_id = aws_vpc.personal_website_vpc.id

  tags = local.common_tags
}


