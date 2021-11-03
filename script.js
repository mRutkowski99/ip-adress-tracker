const API_URL = 'https://geo.ipify.org/api/v2/country,city?apiKey=at_mqj3IrNUv5UVFP8L5FbrybzV1j2Rf&ipAddress='

const ip = document.querySelector('#ip')
const city = document.querySelector('#location')
const postal = document.querySelector('#postal')
const timezone = document.querySelector('#timezone')
const isp = document.querySelector('#isp')

const btn = document.querySelector('#btn')
const input = document.querySelector('#input')
const msg = document.querySelector('.msg')

class Model {
    constructor() {
        this.locationData = {}
    }

    async getLocationData(user = '') {
        const response = await fetch(API_URL + user)
        const data = await response.json()
        this.locationData =  {
            ip: data.ip,
            country: data.location.country,
            city: data.location.city,
            postal: data.location.postalCode,
            lat: data.location.lat,
            lng: data.location.lng,
            timezone: data.location.timezone,
            isp: data.isp
        }
    }
}

class View {
    constructor() {
        this.myMap = L.map('map', {zoomControl: false})
        const attribution = 'Maps &copy; <a href="www.thunderforest.com">Thunderforest</a> Data &copy; <a href="www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        const tileURL = 'https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=9e309f6936044890851a8ce573479d43'
        this.tiles = L.tileLayer(tileURL, { attribution })
        this.tiles.addTo(this.myMap)
        L.control.zoom({
            position: 'bottomleft'
        }).addTo(this.myMap);
    }

    showMsg(info) {
        msg.innerText = info
        msg.classList.add('msg--shown')

        const timeout = window.setTimeout(() => {
            msg.classList.remove('msg--shown')
            window.clearTimeout(timeout)
        }, 2500)
    }

    displayLocationData(locationData) {
        if (!locationData.isp) {
            this.showMsg('IP adress not found')
        }

        ip.innerText = locationData.ip
        city.innerText = `${locationData.city}, ${locationData.country}`
        postal.innerText = locationData.postal
        timezone.innerText = 'UTC' + locationData.timezone
        isp.innerText = locationData.isp
    }

    displayMap(locationData) {
        const latlng = [locationData.lat, locationData.lng]

        this.myMap.setView(latlng, 13);
        
        const myIcon = L.icon({
            iconUrl: 'images/icon-location.svg'
        })

        L.marker(latlng, {icon: myIcon} ).addTo(this.myMap)
    }
}

class Controler {
    constructor(model, view) {
        this.model = model
        this.view = view
        this._defaultLocation()
        btn.addEventListener('click', this._btnHandler.bind(this))
    }

    async _defaultLocation() {
        await this.model.getLocationData()
        this.view.displayLocationData(this.model.locationData)
        this.view.displayMap(this.model.locationData)
    }

    _validateInput() {
        return input.value.match(/^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/)
    }

    async _btnHandler(e) {
        e.preventDefault()

        if (!this._validateInput) {
            this.view.showMsg('Enter valid IP adress')
            return
        }

        await this.model.getLocationData(input.value)
        this.view.displayLocationData(this.model.locationData)
        this.view.displayMap(this.model.locationData)
    }
}

const App = new Controler(new Model, new View) 