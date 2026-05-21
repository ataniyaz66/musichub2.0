terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "aws" {
  region = var.aws_region
}

# ── VPC ─────────────────────────────────────────────────────
resource "aws_vpc" "musichub_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "musichub-vpc" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.musichub_vpc.id
  tags   = { Name = "musichub-igw" }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.musichub_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = { Name = "musichub-public-subnet" }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.musichub_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = { Name = "musichub-public-rt" }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public_rt.id
}

# ── Security Group ───────────────────────────────────────────
resource "aws_security_group" "musichub_sg" {
  name        = "musichub-sg"
  description = "Allow HTTP, HTTPS, SSH, and monitoring ports"
  vpc_id      = aws_vpc.musichub_vpc.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Prometheus"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Grafana"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "musichub-sg" }
}

# ── EC2 Instance ─────────────────────────────────────────────
resource "aws_instance" "musichub_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.musichub_sg.id]
  key_name               = var.key_name

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  user_data = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y docker.io docker-compose-plugin git

    systemctl start docker
    systemctl enable docker

    usermod -aG docker ubuntu

    git clone https://github.com/${var.github_username}/musichub2.0.git /home/ubuntu/musichub
    cd /home/ubuntu/musichub

    echo "JWT_SECRET=${var.jwt_secret}" > .env
    echo "GRAFANA_PASSWORD=${var.grafana_password}" >> .env

    docker compose up -d
  EOF

  tags = { Name = "musichub-server" }
}

# ── Elastic IP ───────────────────────────────────────────────
resource "aws_eip" "musichub_eip" {
  instance = aws_instance.musichub_server.id
  domain   = "vpc"

  tags = { Name = "musichub-eip" }
}