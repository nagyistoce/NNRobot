import io
import socket
import struct
import cv2
import numpy
from PIL import Image

# Start a socket listening for connections on 0.0.0.0:8000 (0.0.0.0 means
# all interfaces)
print "open sockets port 8000"
server_socket = socket.socket()
server_socket.bind(('0.0.0.0', 8000))
print "listening SENSE"
server_socket.listen(0)

print  "Accept a single connection Camera"
connection = server_socket.accept()[0].makefile('rb')
try:
    while True:
        # Read the length of the image as a 32-bit unsigned int. If the
        # length is zero, quit the loop
        image_len = struct.unpack('<L', connection.read(struct.calcsize('<L')))[0]
        if not image_len:
            break
        # Construct a stream to hold the image data and read the image
        # data from the connection
        image_stream = io.BytesIO()
        image_stream.write(connection.read(image_len))
        # Rewind the stream, open it as an image with PIL and do some
        # processing on it
        image_stream.seek(0)
        image = Image.open(image_stream)
        I = numpy.asarray(image)
        im = Image.fromarray(numpy.uint8(I))
        cv2.imshow("Frame", I)
        key = cv2.waitKey(1) & 0xFF
        #print('Image is %dx%d' % image.size)
        image.verify()
        #print('Image is verified')
finally:
    connection.close()
    server_socket.close()