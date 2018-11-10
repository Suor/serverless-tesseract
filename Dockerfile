FROM lambci/lambda:build-python3.6
# There are ARGs below:
#     - version
#     - leptonica_version
#     - tessdata
#     - tessdata_url
# Moved them as low as possible for better caching

# Build leptonica
RUN yum install clang libpng-devel libtiff-devel zlib-devel libwebp-devel libjpeg-turbo-devel -y
ARG leptonica_version=1.76.0
RUN curl http://www.leptonica.org/source/leptonica-${leptonica_version}.tar.gz -o leptonica.tar.gz
RUN tar -xzvf leptonica.tar.gz
RUN cd leptonica-${leptonica_version} && ./configure && make && make install


# Build tesseract
RUN yum install git-core libtool pkgconfig -y
ARG version=4.0.0
RUN git clone -b $version https://github.com/tesseract-ocr/tesseract.git tesseract-ocr
RUN (export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig; \
     cd tesseract-ocr && ./autogen.sh && ./configure && make && make install)


# Combine artifact dir
RUN mkdir -p tesseract-standalone/lib           \
    && cd tesseract-standalone                  \
    && cp /usr/local/bin/tesseract .            \
    && cp /usr/local/lib/libtesseract.so.4 lib/ \
    && cp /usr/local/lib/liblept.so.5 lib/      \
    && cp /usr/lib64/libpng12.so.0 lib/         \
    && cp /usr/lib64/libjpeg.so.62 lib/         \
    && cp /usr/lib64/libwebp.so.4 lib/          \
    && cp /usr/lib64/libstdc++.so.6 lib/
RUN mkdir -p tesseract-standalone/tessdata/configs       \
    && cd tesseract-standalone/tessdata                  \
    && cp /usr/local/share/tessdata/configs/pdf configs/ \
    && cp /usr/local/share/tessdata/pdf.ttf .


# Add language data
ARG tessdata="osd eng"
ARG tessdata_url="https://github.com/tesseract-ocr/tessdata/raw/master/"
RUN for pack in $tessdata; do curl -L "$tessdata_url$pack.traineddata" \
                                   -o "tesseract-standalone/tessdata/$pack.traineddata"; done
