provider "aws" {
  region = var.aws_region
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

provider "neon" {
  api_key = var.neon_org_api_key
}
