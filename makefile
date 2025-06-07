# 29-5-2025 Terry.He 230263367@stu.vtc.edu.hk
# Makefile for Cloudflare Workers project (EEE4464)

# run wrangler dev server
run:
	npx wrangler dev --remote

# watching log
watch:
	npx wrangler tail

init:
	npx wrangler init --site
	wrangler login