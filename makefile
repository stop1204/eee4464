# 29-5-2025 Terry.He 230263367@stu.vtc.edu.hk
# Makefile for Cloudflare Workers project (EEE4464)

# run wrangler dev server
run:
	npx wrangler dev --remote

# watching log
watch:
	npx wrangler tail
export:
	# to execute D1 SQL file:
	# npx wrangler d1 execute example-db --remote --file=users_export.sql
	#	To export full D1 database schema and data:
	#    npx wrangler d1 export <database_name> --remote --output=./database_30Jun.sql
	#
	#    To export single table schema and data:
	#    npx wrangler d1 export <database_name> --remote --table=<table_name> --output=./table.sql
	#
	#    To export only D1 database schema:
	#    npx wrangler d1 export <database_name> --remote --output=./schema.sql --no-data
	#
	#    To export only D1 table schema:
	#    npx wrangler d1 export <database_name> --remote --table=<table_name> --output=./schema.sql --no-data
	#
	#    To export only D1 database data:
	#    npx wrangler d1 export <database_name> --remote --output=./data.sql --no-schema
	#
	#    To export only D1 table data:
	#    npx wrangler d1 export <database_name> --remote --table=<table_name> --output=./data.sql --no-schema
	npx wrangler d1 export eee4464 --remote --output ./database.sql


init:
	npx wrangler init --site
	wrangler login