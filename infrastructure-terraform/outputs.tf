output "DBAddress" {
  value = aws_db_instance.simple_social_database.address
}

output "S3BucketDomainName" {
  value = aws_s3_bucket.simple_social_storage.bucket_domain_name
}

