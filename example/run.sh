#!/bin/bash

rm -f processed.txt
rm -f corpus.*


python preprocess.py fasttext_formatted_corpus.txt
python split_test_train.py processed.txt
python createModel.py corpus.train.txt corpus.test.txt
