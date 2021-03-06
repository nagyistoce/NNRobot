import socket
import ExplorationInterface as Exp
import pickle
import time
class robotStream:
    def __init__(self,ip):
        print 'conecting...'
        self.robotSystem = Exp.ExploreInterface("exp",True,True,ip)

    def connection(self):
        print 'The robot started', self.robotSystem.RobotStarted
        while(self.robotSystem.RobotStarted):
            # Connect a client socket to my_server:8000 (change my_server to the
            # hostname of your server) 190.158.131.76
            try:
                self.client_socket = socket.socket()
                self.client_socket.connect(('190.158.131.76', 8080))
                self.connect = True
                self.istalk = False
                try:
                   while(True):
                       self.startingConv()
                       self.data = self.getData()
                       self.data = self.data.split(":")
                       self.getClosestDistance()
                       self.isHeadingDone()
                       self.rotate()
                       self.rotateSecure()
                       self.restartHeading()
                       self.getTh()
                       self.getClosesFrontDistance()
                       self.move()
                       self.getLaserBuffer()
                       self.getMaxReadings()
                       self.getMaxDistance()
                       #print "sended"
                except Exception as ex:
                    self.connect = False
                    print "connection finished...",str(ex)
                finally:
                    self.client_socket.close()
            except Exception as ex:
                self.connect = False
                print "trying Connect Robot...",str(ex)
                time.sleep(2)

    def getData(self):
        data = self.client_socket.recv(1024).decode()
        print data
        return data

    def setData(self,data):
        print 'data sended',data
        self.client_socket.send(b''+str(data))

    def startingConv(self):
        if not self.istalk:
            self.client_socket.send(b'raspChappie')
            self.data = self.getData()
            if self.data == "HiRasp":
                print self.data
                self.setData(b'ok')
                self.istalk = True


    def getClosestDistance(self):
        if self.data[0] == "getClosestDistance":
            start = int(self.data[1])
            end = int(self.data[2])
            lmoves = []
            for x in range(start,end,-1):
                xend = x-1
                distance,angle = self.robotSystem.getClosestDistance(x,xend)
                estimation = self.calculateProbToMove(distance)
                lmoves.append([angle,distance,estimation])
            data_string = pickle.dumps(lmoves)
            print lmoves
            self.client_socket.send(data_string)

    def isHeadingDone(self):
        if self.data[0] == "isHeadingDone":
            data = self.robotSystem.robot.isHeadingDone()
            self.setData(data)

    def rotate(self):
        if self.data[0] == "rotate":
            print self.data
            self.robotSystem.rotate(float(self.data[1]))
            self.setData(b'ok')

    def rotateSecure(self):
        if self.data[0] == "rotateSecure":
            print self.data
            self.robotSystem.rotateSecure(float(self.data[1]))
            self.setData(b'ok')

    def restartHeading(self):
        if self.data[0] == "restartHeading":
            self.robotSystem.restartHeading()
            self.setData(b'ok')

    def getTh(self):
        if self.data[0] == "getTh":
            data = self.robotSystem.robot.getPose().getTh()
            self.setData(data)

    def getClosesFrontDistance(self):
        if self.data[0] == "getClosestFrontDistance":
            data = self.robotSystem.getClosesFrontDistance()
            self.setData(data)

    def move(self):
        if self.data[0] == "move":
            print self.data
            self.robotSystem.move(float(self.data[1]))
            self.setData(b'ok')

    def getLaserBuffer(self):
        if self.data[0] == "getLaserBuffer":
            try:
                data = self.robotSystem.getLaserBuffer()
                print 'data#$$$--', data
                data_string = pickle.dumps(data)
                print 'data#$$$--',data
                print 'datra_string--',data_string
                print len(data_string),"  getlaserbuffer"
                self.client_socket.send(data_string)
            except Exception,ex:
                print "getlaserbuffer########################################################################################################",str(ex)


    def getMaxReadings(self):
        if self.data[0] == "getMaxReadings":
            data = self.robotSystem.MAXREADINGS
            self.setData(data)

    def getMaxDistance(self):
        if self.data[0] == "getMaxDistance":
            data = self.robotSystem.MAXDISTANCE
            self.setData(data)

    def calculateProbToMove(self, distance):
        # calculate the final value estimation to move between distance and bestway
        scaledistance = (distance / self.robotSystem.MAXDISTANCE)
        moveestimate = (scaledistance)
        return moveestimate
