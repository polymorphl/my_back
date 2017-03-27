echo "Generate a SSL cert"

# Create ssl folder if it does not exist
mkdir -p ssl

# prepare Fake config
# for $PWD.dev (my_front.dev)
cat > openssl.cnf <<-EOF
  [req]
  distinguished_name = req_distinguished_name
  x509_extensions = v3_req
  prompt = no
  [req_distinguished_name]
  CN = *.${PWD##*/}.dev
  [v3_req]
  keyUsage = keyEncipherment, dataEncipherment
  extendedKeyUsage = serverAuth
  subjectAltName = @alt_names
  [alt_names]
  DNS.1 = *.${PWD##*/}.dev
  DNS.2 = ${PWD##*/}.dev
EOF

# Generate a valid self signed certificate for development (ssl key and crt)
openssl req \
  -new \
  -newkey rsa:2048 \
  -sha1 \
  -days 3650 \
  -nodes \
  -x509 \
  -keyout ssl/server.key \
  -out ssl/server.crt \
  -config openssl.cnf

rm openssl.cnf
