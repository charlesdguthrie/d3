import csv, simplejson, urllib
from BeautifulSoup import BeautifulSoup

# Base URL for country API call
api_url = "http://api.worldbank.org/countries/"

# CSV header
print "CountryCode,RegionCode,RegionName"

# Load CSV file with country codes
reader = csv.reader(open("life-expectancy-cleaned-all.csv", "r"), delimiter=",")

# Get region for each country in CSV
skipped_header = False
for row in reader:
    
    if not skipped_header:
        skipped_header = True
        continue
    
    country_code = row[1]
    url = api_url + country_code + "?format=xml"
    
    # Fetch data from full API url
    xml_data = urllib.urlopen(url)
    
    # Parse XML repsonse
    soup = BeautifulSoup(xml_data)
    region = soup.findAll("wb:region")
    region_code = region[0]['id']
    region_name = region[0].string
    
    print country_code + "," + region_code + "," + region_name
    