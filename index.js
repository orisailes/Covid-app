async function covidFetch(url) {
    try {
        const response = await fetch(url)
        const data = await response.json()
        myCovidData.push(data)
        myCovidData[0].data.forEach(element => {
            covidMap.push({
                countryName: element.name,
                countryCode: element.code,
                countryCovidData: element.latest_data,
                countryCovidDataToday: element.today,
            })
        })
    } catch {
        handleErr(`Feth failed`)
    }
}

async function countriesFetch(url) {
    try {
        const response = await fetch(url)
        const data = await response.json()
        data.forEach(element => {
            countriesMap.push({
                code: element.cca2,
                region: element.region,
                name: element.name.common,
            })
        })
    } catch {
        handleErr(`Fetch Fail`)
    }
}

function handleErr(err = `something went wrong`) {
    console.log(err)
    myChart.clear()
    errorDiv.classList.remove(`hidden`)
}

const statusBtns = document.querySelector(`.buttons-status-container`)
const errorDiv = document.querySelector(`.error`)
let deathRateBtn = document.querySelector(`#death-rate`)
let recoveryRateBtn = document.querySelector(`#recovery-rate`)
const covidEndpoint = "https://corona-api.com/countries"
const countriesEndpoint = "https://api.codetabs.com/v1/proxy/?quest=https://restcountries.herokuapp.com/api/v1"
let myCovidData = [];
let covidMap = [];
let countriesMap = [];
covidFetch(covidEndpoint);
countriesFetch(countriesEndpoint)
let dataByRegion = [];
let newLabelName = [];
let newData = [];

//! chart
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: '',
            data: [],
            backgroundColor: [

            ],
            borderColor: [

            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
//! end chart


function updateChartsByClick(e) {
    statusBtns.classList.remove(`hidden`)
    try {
        errorDiv.classList.add(`hidden`)
        deathRateBtn.classList.add(`hidden`)
        recoveryRateBtn.classList.add(`hidden`)
        document.querySelector(`.lds-facebook`).classList.remove(`hidden`)
        //!array for all match data(names&covid status)
        dataByRegion = [];
        //!array for all new names(x)
        newLabelName = [];
        //!array for all new covid data(y)
        newData = [];
        //!the button text content plays the region finding role
        let region = e.currentTarget.textContent;
        if(region===`World`){
            countriesMap.forEach(element => {
                dataByRegion.push({
                    name: element.name,
                    ID: element.code
                })
            })

        }
        countriesMap.forEach(element => {
            if (element.region === region) {
                dataByRegion.push({
                    name: element.name,
                    ID: element.code
                })
            }
        })

        for (let i = 0; i < dataByRegion.length; i++) {
            for (let x = 0; x < covidMap.length; x++) {
                if (covidMap[x].countryCode == dataByRegion[i].ID) {
                    dataByRegion[i].covidData = covidMap[x].countryCovidData
                };
            };
        };
        dataByRegion.forEach(element => {
            newLabelName.push(element.name)
            if (element.covidData) {
                newData.push(element.covidData.confirmed)
            }
        });
        myChart.data.labels = newLabelName
        myChart.data.datasets[0].data = newData
        myChart.data.datasets[0].label = "Confirmed cases"
        for (let i = 0; i < newData.length; i++) {
            myChart.data.datasets[0].backgroundColor[i] = "rgba(229, 80, 0, 0.6)"
        }
    } catch {
        handleErr(`Fail to display data on funtion line 87`)
    }
    myChart.update();
    document.querySelector(`#myChart`).classList.remove(`hidden`)
    document.querySelector(`.buttons-status-container`).classList.remove(`hidden`)
    makeCountriesDivs()
    document.querySelector(`.lds-facebook`).classList.add(`hidden`)
}

function makeCountriesDivs() {
    statusBtns.classList.remove(`hidden`)
    errorDiv.classList.add(`hidden`)
    document.querySelector(`.lds-facebook`).classList.remove(`hidden`)
    try {
        const textContainer = document.querySelector(`.text`);
        textContainer.innerHTML = ``
        newLabelName.forEach(el => {
            countryNameDiv = `
        <button class="btn countryBtn"><h4>${el}</h4></button>
        `;
            textContainer.innerHTML += countryNameDiv;
        })
        const myCountriesBtns = document.querySelectorAll(`.countryBtn`)
        myCountriesBtns.forEach(e => {
            e.addEventListener(`click`, displayIndividualCountry)
        })
    } catch {
        (handleErr(`Fail to display countries`))
    }
    document.querySelector(`.lds-facebook`).classList.add(`hidden`)
}

function changeColor(color) {
    for (let i = 0; i < newData.length; i++) {
        myChart.data.datasets[0].backgroundColor[i] = color
    }
}

function updateDataByClick(e) {
    statusBtns.classList.remove(`hidden`)
    //!the first line of buttons
    errorDiv.classList.add(`hidden`)
    document.querySelector(`.lds-facebook`).classList.remove(`hidden`)
    newData = []
    myChart.data.datasets[0].label = `${e.currentTarget.textContent} cases`
    const status = e.currentTarget.textContent.toLowerCase();
    dataByRegion.forEach(e => {
        e.covidData ? newData.push(e.covidData[status]) : ``;
    })
    switch (status) {
        case `deaths`:
            changeColor("rgba(0, 0, 0, 0.8)")
            break;
        case `confirmed`:
            changeColor("rgba(229, 80, 0, 0.8)")
            break;
        case `recovered`:
            changeColor("rgba(0, 238, 255, 0.8)")
            break;
        case `critical`:
            changeColor("rgba(225, 0, 0, 0.8)")
            break;
    }
    myChart.data.datasets[0].data = newData;
    myChart.update();
    document.querySelector(`.lds-facebook`).classList.add(`hidden`)
}

function displayIndividualCountry(e) {
    statusBtns.classList.add(`hidden`)
    //!after user click specific country
    errorDiv.classList.add(`hidden`)
    document.querySelector(`.lds-facebook`).classList.remove(`hidden`)
    newData = [];
    try {
        const found = covidMap.find(element => {
            return element.countryName === e.currentTarget.textContent ? element.countryCovidData : ``;
        })
        deathRateBtn.classList.remove(`hidden`)
        recoveryRateBtn.classList.remove(`hidden`)

        for (let stat in found.countryCovidData) {
            newData.push(found.countryCovidData[stat])
        }
        newData.pop()
        found.countryCovidData.calculated.death_rate ? newData.push(found.countryCovidData.calculated.death_rate) : newData.push(`N/A`)
        found.countryCovidData.calculated.recovery_rate ? newData.push(found.countryCovidData.calculated.recovery_rate) : newData.push(`N/A`)
        myChart.data.datasets[0].label = e.currentTarget.textContent
        myChart.data.datasets[0].data = newData
        myChart.data.labels = [`Deaths`, `Confirmed`, `Recovered`, `Critical`, `Death Rate`, `Recovery Rate`]
        if (newData[0] < 1000) {
            changeColor("rgba(0, 255, 42, 0.8)")
        } else {
            changeColor("rgba(225, 0, 0, 0.8)")
        }
        myChart.update();
    } catch {
        handleErr(`Cant get ${e.currentTarget.textContent} covid data.`)
    }
    document.querySelector(`.lds-facebook`).classList.add(`hidden`)
}


//!initializ btn clicks
//*location buttons
const asiaBtn = document.querySelector(`#asia`)
asiaBtn.addEventListener('click', updateChartsByClick)
const europeBtn = document.querySelector(`#europe`)
europeBtn.addEventListener('click', updateChartsByClick)
const americasBtn = document.querySelector(`#americas`)
americasBtn.addEventListener('click', updateChartsByClick)
const oceaniaBtn = document.querySelector(`#oceania`)
oceaniaBtn.addEventListener('click', updateChartsByClick)
const africaBtn = document.querySelector(`#africa`)
africaBtn.addEventListener('click', updateChartsByClick)
const worldBtn = document.querySelector(`#world`)
worldBtn.addEventListener('click', updateChartsByClick)

//*status buttons
const deathsBtn = document.querySelector(`#deaths`)
deaths.addEventListener('click', updateDataByClick)
const confirmedBtn = document.querySelector(`#confirmed`)
confirmedBtn.addEventListener('click', updateDataByClick)
const recoverdBtn = document.querySelector(`#recovered`)
recoverdBtn.addEventListener('click', updateDataByClick)
const criticalBtn = document.querySelector(`#critical`)
criticalBtn.addEventListener('click', updateDataByClick)