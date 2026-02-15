from efipay.constants import Constants

pix = Constants.APIS['PIX']['ENDPOINTS']
for name, config in pix.items():
    print(name, config['method'], config['route'])
