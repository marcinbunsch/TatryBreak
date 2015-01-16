SHELL=/bin/bash -O extglob -c
EXTENSION_NAME=tatrrace

all:
	rm -rf $(EXTENSION_NAME) $(EXTENSION_NAME).crx $(EXTENSION_NAME).pem
	mkdir $(EXTENSION_NAME)
	cp -r !($(EXTENSION_NAME)) $(EXTENSION_NAME)/
	/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension=$(EXTENSION_NAME)
	rm -rf $(EXTENSION_NAME) $(EXTENSION_NAME).pem
