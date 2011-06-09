
SOURCE = ./coffee
BUILDDIR = ./script

INPUT_SUFFIX = .coffee
OUTPUT_SUFFIX = .js

COFFEE = /usr/local/bin/coffee
COFFEE_OPTIONS = -bcs

BUILD_COMMAND = cat $< | \
	$(COFFEE) $(COFFEE_OPTIONS) > $@

.PHONY: all build-all lib PhotosViewer clean

all: build-all
build-all: lib PhotosViewer

lib: $(BUILDDIR)/lib$(OUTPUT_SUFFIX)
PhotosViewer: $(BUILDDIR)/PhotosViewer$(OUTPUT_SUFFIX)

$(BUILDDIR)/lib$(OUTPUT_SUFFIX): $(SOURCE)/lib$(INPUT_SUFFIX)
	cat $(SOURCE)/HTTPRequest.coffee \
		$(SOURCE)/HTMLMaker.coffee \
		$(SOURCE)/URIRules.coffee \
		$(SOURCE)/Tumblr.coffee | \
		$(COFFEE) $(COFFEE_OPTIONS) > $@

$(BUILDDIR)/PhotosViewer$(OUTPUT_SUFFIX): $(SOURCE)/PhotosViewer$(INPUT_SUFFIX)
	$(BUILD_COMMAND)

clean:
	rm -f $(BUILDDIR)/*$(OUTPUT_SUFFIX)
