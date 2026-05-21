output "server_public_ip" {
  description = "Public IP of the MusicHub server"
  value       = aws_eip.musichub_eip.public_ip
}

output "app_url" {
  description = "Application URL"
  value       = "http://${aws_eip.musichub_eip.public_ip}"
}

output "grafana_url" {
  description = "Grafana URL"
  value       = "http://${aws_eip.musichub_eip.public_ip}:3001"
}

output "prometheus_url" {
  description = "Prometheus URL"
  value       = "http://${aws_eip.musichub_eip.public_ip}:9090"
}

output "ssh_command" {
  description = "SSH command to connect"
  value       = "ssh -i ${var.key_name}.pem ubuntu@${aws_eip.musichub_eip.public_ip}"
}