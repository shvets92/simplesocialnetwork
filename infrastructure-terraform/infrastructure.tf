provider "aws" {
  region  = var.region
  version = "~> 2.16.0"
}

resource "aws_vpc" "simple_social_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = "true"
  enable_dns_support   = "true"

  tags = {
    Name = "simple_social_vpc"
  }
}
resource "aws_subnet" "simple_social_subnet-a" {
  vpc_id            = aws_vpc.simple_social_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = var.availability-zone-a

  tags = {
    Name = "simple_social_subnet-a"
  }
}
resource "aws_subnet" "simple_social_subnet-b" {
  vpc_id            = aws_vpc.simple_social_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = var.availability-zone-b

  tags = {
    Name = "simple_social_subnet-b"
  }
}
resource "aws_db_subnet_group" "simple_social_subnet_group" {
  name       = "simple_social_subnet_group"
  subnet_ids = [aws_subnet.simple_social_subnet-a.id, aws_subnet.simple_social_subnet-b.id]

  tags = {
    Name = "simple_social_subnet_group"
  }
}
resource "aws_security_group" "simple_social_security_group" {
  name        = "simple_social_security_group"
  description = "Security group for simple social network"
  vpc_id      = aws_vpc.simple_social_vpc.id

  //SSH access to ec2 instance from my computer
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.myipaddress]
  }

  //HTTP access to the world
  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  //Direct access to Postgres database from my computer
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.myipaddress]
  }

  //Access to Postgress database from entities within the security group
  ingress {
    from_port = 5432
    protocol = "tcp"
    to_port = 5432
    self = true
  }

  //Direct access to neo4j from my computer
  ingress {
    from_port = 7474
    protocol = "tcp"
    to_port = 7474
    cidr_blocks = [var.myipaddress]
  }
  ingress {
    from_port = 7687
    protocol = "tcp"
    to_port = 7687
    cidr_blocks = [var.myipaddress]
  }

  //Access to neo4j from within the security group
  ingress {
    from_port = 7474
    protocol = "tcp"
    to_port = 7474
    self = true
  }
  ingress {
    from_port = 7687
    protocol = "tcp"
    to_port = 7687
    self = true
  }

  //Default allow all egress
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_internet_gateway" "simple_social_gateway" {
  vpc_id = aws_vpc.simple_social_vpc.id

  tags = {
    Name = "simple_social_gateway"
  }
}
resource "aws_route_table" "simple_social_route_table" {
  vpc_id = aws_vpc.simple_social_vpc.id
  depends_on = [aws_internet_gateway.simple_social_gateway]

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.simple_social_gateway.id
  }
}
resource "aws_main_route_table_association" "simple_social_route_association" {
  vpc_id         = aws_vpc.simple_social_vpc.id
  route_table_id = aws_route_table.simple_social_route_table.id
}
resource "aws_eip" "simple_social_address" {
  depends_on = [aws_internet_gateway.simple_social_gateway]
  instance = aws_instance.simple_social_ec2.id
}

resource "aws_db_instance" "simple_social_database" {
  allocated_storage      = 20
  storage_type           = "gp2"
  engine                 = "postgres"
  engine_version         = "10.6"
  instance_class         = "db.t2.micro"
  name                   = "simple_social_database"
  username               = var.dbusername
  password               = var.dbpassword
  publicly_accessible    = "true"
  vpc_security_group_ids = [aws_security_group.simple_social_security_group.id]
  port                   = 5432
  db_subnet_group_name   = aws_db_subnet_group.simple_social_subnet_group.id
  final_snapshot_identifier = "simple-social-postgres-snapshot"
  snapshot_identifier = "simple-social-postgres-snapshot"
}

resource "aws_s3_bucket" "simple_social_storage" {
  acl           = "private"
  bucket        = "simple-social-storage-shvets92"
  force_destroy = true
  tags = {
    Name = "simple_social_storage"
  }
}

resource "aws_instance" "simple_social_ec2" {
  ami           = "ami-02e2344e088dc85f2"
  instance_type = "t2.medium"
  key_name      = "simpleSocialKeyEc2"
  subnet_id = aws_subnet.simple_social_subnet-a.id
  vpc_security_group_ids = [aws_security_group.simple_social_security_group.id]
  iam_instance_profile = aws_iam_instance_profile.simple_social_ec2_s3_access_profile.name
}
resource "aws_iam_role" "simple_social_ec2_s3_access_role" {
  name = "simple_social_ec2_s3_access_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}
resource "aws_iam_instance_profile" "simple_social_ec2_s3_access_profile" {
  name = "simple_social_ec2_s3_access_profile"
  role = aws_iam_role.simple_social_ec2_s3_access_role.name
}
resource "aws_iam_role_policy" "simple_social_ec2_s3_access_policy" {
  name = "simple_social_ec2_s3_access_policy"
  role = aws_iam_role.simple_social_ec2_s3_access_role.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}