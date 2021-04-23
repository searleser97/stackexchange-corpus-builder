import requests
from os import path

baseUrl = 'https://api.stackexchange.com/2.2/'

mainUrl = 'questions?sort=desc'
# url = '&pagesize=5&site=sports'
pagesize = 100


def getListOfSiteNames():
    sitesUrl = path.join(baseUrl, 'sites?pagesize=500')
    sitesReq = requests.get(sitesUrl)
    sites = sitesReq.json()['items']

    siteNames = []

    for site in sites:
        if site['site_type'] == 'main_site':
            siteName = site['api_site_parameter']
            siteNames.append(siteName)

    return siteNames


siteNames = getListOfSiteNames()
siteNames.sort()

print(siteNames)

print('count:', len(siteNames))
