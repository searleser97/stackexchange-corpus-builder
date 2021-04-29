import random
import sys


def main():
    with open(sys.argv[1], "r") as f:
        while (True):
            line = f.readline()
            if not line:
                break
            if (random.random() <= .8):
                with open("corpus.train.txt", "a+") as ctrain:
                    ctrain.write(line)
            else:
                with open("corpus.test.txt", "a+") as ctest:
                    ctest.write(line)


if __name__ == '__main__':
    if (len(sys.argv) < 2):
        print("missing file name")
        exit(0)
    main()
