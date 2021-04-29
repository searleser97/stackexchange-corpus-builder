from text_preprocessing import preprocess_text
import text_preprocessing
import sys


def main():
    funcs = [
        text_preprocessing.to_lower,
        text_preprocessing.remove_url,
        text_preprocessing.remove_email,
        text_preprocessing.remove_number,
        text_preprocessing.expand_contraction,
        text_preprocessing.remove_special_character,
        text_preprocessing.remove_punctuation,
        text_preprocessing.remove_whitespace,
        # text_preprocessing.remove_stopword,
        text_preprocessing.lemmatize_word,
    ]
    with open(sys.argv[1]) as f:
        linecnt = 0
        while (True):
            line = f.readline()
            if not line:
                break
            with open("processed.txt", "a+") as pf:
                sentStartIndex = line.find('"')
                sent = line[sentStartIndex:]
                labels = line[:sentStartIndex]
                processed_line = labels + preprocess_text(sent, funcs) + '\n'
                pf.write(processed_line)
            linecnt += 1
            if (linecnt % 10000 == 0):
                print(linecnt)


if __name__ == '__main__':
    if (len(sys.argv) < 2):
        print("missing file name")
        exit(0)
    main()
