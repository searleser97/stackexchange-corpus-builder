import fasttext
import sys


def main():

    # model = fasttext.train_supervised(input=sys.argv[1],
    # lr=0.3,
    # epoch=25,
    # wordNgrams=2,
    # bucket=200000,
    # dim=50,
    # loss='ova')

    model = fasttext.train_supervised(input=sys.argv[1],
                                      lr=0.6,
                                      epoch=25,
                                      wordNgrams=2,
                                      bucket=200000,
                                      dim=50,
                                      loss='hs')

    model.save_model("model.bin")
    print(model.test(sys.argv[2]))


if __name__ == "__main__":
    if (len(sys.argv) < 3):
        print("missing arguments")
    main()
