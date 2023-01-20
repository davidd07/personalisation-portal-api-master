IMAGE_REGISTRY = swrepos.auiag.corp
IMAGE_REPOSITORY = dce
IMAGE_NAME = pay-excess-middleware
IMAGE_VERSION = latest
IMAGE_TAG = $(IMAGE_REGISTRY)/$(IMAGE_REPOSITORY)/$(IMAGE_NAME):$(IMAGE_VERSION)
SKIP_TESTS = false

WORKING_DIR := $(shell pwd)

DOCKER_FILE ?= Dockerfile

.PHONY: build push verify hash

release:: build push verify hash

ci:: build hash

push::
	@echo "-----------------Pushing docker image-----------------"
	@docker push $(IMAGE_TAG)

build::
	@echo "-----------------Creating docker image-----------------"
	@docker build \
		-t $(IMAGE_TAG) \
		--file ${DOCKER_FILE} \
		--build-arg http_proxy=http://proxy.auiag.corp:8080 \
		--build-arg https_proxy=http://proxy.auiag.corp:8080 \
		--build-arg no_proxy=iag.com.au,auiag.corp,devlabs \
		--build-arg BUILD_VERSION=$(IMAGE_VERSION) \
		--build-arg SKIP_TESTS=$(SKIP_TESTS) \
		--rm=true \
		$(WORKING_DIR)

verify::
	@docker run $(IMAGE_REGISTRY)/devlabs/devlabs-scripts:latest bash /scripts/common/scan_image.sh  -r $(IMAGE_REPOSITORY) -i $(IMAGE_NAME):$(IMAGE_VERSION) $(BYPASS_ERROR)

hash::
	@echo "$(shell (tr '[:lower:]' '[:upper:]' | tr '-' '_') \
		<<< $(IMAGE_NAME))=$$(docker inspect \
		--format='{{(index (split (index .RepoDigests 0) ":") 1)}}' \
		$(IMAGE_TAG))" > sha256

extract::
	@docker cp $$(docker ps --format "{{.Names}}" -al):$(EXTRACT_PATH) .
