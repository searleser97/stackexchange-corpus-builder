import requests
from os import path


class CorpusBuilder:
    def baseUrl(self):
        return 'https://api.stackexchange.com/2.2/'

    def getListOfSiteNames(self):
        sitesUrl = path.join(self.baseUrl(), 'sites?pagesize=500')
        sitesReq = requests.get(sitesUrl)
        sites = sitesReq.json()['items']

        siteNames = []

        for site in sites:
            if site['site_type'] == 'main_site':
                siteName = site['api_site_parameter']
                siteNames.append(siteName)
                print(siteName)

        return siteNames

    def getQuestionsCount(self, siteName: str) -> int:
        # url that returns the questions count
        qCountUrl = path.join(self.baseUrl(),
                              'questions') + f'?site={siteName}&filter=total'
        qCount = requests.get(qCountUrl).json()['total']
        return qCount

    def getQuestions(self, siteName: str, count: int):
        qUrl = path.join(self.baseUrl(),
                         'questions') + f'?site={siteName}&pagesize=100'

        allQuestions = []
        pageIndex = 1

        while (len(allQuestions) < count):
            req = requests.get(qUrl + f'&page={pageIndex}').json()
            questions = req['items']
            for questionItem in questions:
                if (len(allQuestions) >= count):
                    break
                allQuestions.append(questionItem)
            pageIndex += 1

        return allQuestions

    def getLabeledQuestions(self, siteNameAsLabel=True, questionsPerSite=5000):
        siteNames = []
        siteNamesFile = 'siteNames.txt'
        if path.exists(siteNamesFile):
            with open(siteNamesFile) as f:
                siteNames = f.read().splitlines()
        else:
            siteNames = self.getListOfSiteNames()
            with open(siteNamesFile, 'w') as f:
                sitesStr = ''
                for site in siteNames:
                    sitesStr += f'{site}\n'
                f.write(sitesStr)
        questionsWithLabels = []
        for site in siteNames:
            if (self.getQuestionsCount(site) >= questionsPerSite):
                print(site, questionsPerSite)
                for questionItem in self.getQuestions(site, questionsPerSite):
                    # labels = questionItem['tags']
                    labels = []
                    if (siteNameAsLabel):
                        labels.append(site)
                    labeledQuestion = (labels, questionItem['title'])
                    # questionsWithLabels.append(labeledQuestion)
                    self.writeLabeledTextForFasttext(labeledQuestion)

        return questionsWithLabels

    def writeLabeledTextForFasttext(labeledQuestion: str):
        with open('output.txt', 'utf8') as f:
            labels = ''
            for label in labeledQuestion[0]:
                labels += f'__label__{label} '
            f.write(f'{labels}{labeledQuestion[1]}\n')


cb = CorpusBuilder()
labeledQs = cb.getLabeledQuestions(siteNameAsLabel=True, questionsPerSite=10)

for qItem in labeledQs:
    print(qItem)
