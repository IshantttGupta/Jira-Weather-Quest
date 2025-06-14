//forntend part

import React, {useEffect, useState} from "react";
import ForgeReconciler, { Text, useProductContext, Textfield, Form, Button, FormSection, FormFooter, Label, RequiredAsterisk, useForm, RadioGroup, ErrorMessage, Box, Inline, xcss, Heading, Strong, Image } from "@forge/react";
import { invoke, view } from "@forge/bridge";

let currentCC = null;

export const Edit = () => {
  const { handleSubmit, register, getValues, formState } = useForm();
  const [locationOptions, setLocationOptions] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const { errors } = formState;

  const getOptions = () => {
    const values = getValues();

    if(values.city && values.country){

      if(currentCC && (currentCC.city == values.city)&&(currentCC.country == values.country)) {
      } else {
        currentCC = {
          city: values.city,
          country: values.country }

        invoke('getLocationCoordinates', {location: values}).then((val) => {
          setLocationOptions(val);
          setShowOptions(true);
        });
      }
    }
  };

  const configureGadget = (data) => {
    view.submit(locationOptions[data.location])
  }

  function locationOption(obj, index, array) {
    return { name: "location", label: obj.name + ", " + obj.state + ", " + obj.country, value: index }
  }

  return (
      <>
        <Form onSubmit={handleSubmit(configureGadget)}>
          <FormSection>
            <Label>City<RequiredAsterisk /></Label>
            <Textfield {...register("city", { required: true, onChange: getOptions() })} />
            <Label>Country<RequiredAsterisk /></Label>
            <Textfield {...register("country", { required: true })} />
            {showOptions && <Label>Select your location<RequiredAsterisk /></Label>}
            {showOptions && (
                <RadioGroup {...register("location", {required: true})} options={locationOptions.map(locationOption)}/>
            )}
            {errors["location"] && <ErrorMessage>Select a location</ErrorMessage>}
          </FormSection>
          <FormFooter>
            {showOptions && <Button appearance="primary" type="submit">
              Submit
            </Button>}
          </FormFooter>
        </Form>
      </>
  );
};

const View = () => {
  const [forecast, setForecast] = useState(null);
  const context = useProductContext();

  useEffect(() => {
    invoke('getWeatherForecast').then(setForecast);
  }, []);

  const forecastRowStyle = xcss({
    display: 'flex',
    flexDirection: 'row',
    gap: 'space.200',
    overflowX: 'auto',
    paddingBottom: 'space.150',
  });

  const containerStyle = xcss({
    padding: 'space.250',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #e0f7fa, #80deea)',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    minWidth: '280px',
    flexShrink: 0,
    color: '#004d40',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  });

  const inlineStyle = xcss({
    alignItems: 'center',
    gap: 'space.150',
  });

  const imageStyle = xcss({
    width: '70px',
    height: '70px',
    flexShrink: 0,
  });

  const textBoxStyle = xcss({
    display: 'flex',
    flexDirection: 'column',
    gap: 'space.075',
  });

  const headingStyle = xcss({
    marginBottom: 'space.350',
    fontWeight: 'bold',
    fontSize: '28px',
    color: '#00796b',
    textShadow: '1px 1px 2px #004d40',
  });

  const getWeatherEmoji = (desc) => {
    desc = desc.toLowerCase();
    if (desc.includes('clear')) return '☀️';
    if (desc.includes('cloud')) return '☁️';
    if (desc.includes('rain')) return '🌧️';
    if (desc.includes('thunderstorm')) return '⛈️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('mist') || desc.includes('fog')) return '🌫️';
    return '🌈';
  };

  const tempStyle = xcss({
    fontWeight: '600',
    color: '#004d40',
  });
  const feelsLikeStyle = xcss({
    fontWeight: '600',
    color: '#00796b',
  });
  const humidityStyle = xcss({
    fontWeight: '600',
    color: '#004d40',
  });
  const weatherDescStyle = xcss({
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#00695c',
  });

  const dailyForecasts =
      forecast?.list?.filter((entry) => entry.dt_txt.includes('12:00:00')) ?? [];

  return (
      <>
        <Heading as="h2" xcss={headingStyle}>
          {forecast ? forecast.city.name : 'Loading...'} 5-Day Forecast
        </Heading>

        <Box xcss={forecastRowStyle}>
          {dailyForecasts.map((day, index) => (
              <Box key={index} xcss={containerStyle}>
                <Inline xcss={inlineStyle}>
                  <Image
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                      alt={day.weather[0].description}
                      xcss={imageStyle}
                  />
                  <Box xcss={textBoxStyle}>
                    <Text>
                      <Strong>
                        {new Date(day.dt_txt).toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Strong>
                    </Text>
                    <Text xcss={tempStyle}>🌡️ Temp: {day.main.temp} °C</Text>
                    <Text xcss={feelsLikeStyle}>🤗 Feels like: {day.main.feels_like} °C</Text>
                    <Text xcss={humidityStyle}>💧 Humidity: {day.main.humidity}%</Text>
                    <Text xcss={weatherDescStyle}>
                      {getWeatherEmoji(day.weather[0].description)}{' '}
                      {day.weather[0].description.charAt(0).toUpperCase() +
                          day.weather[0].description.slice(1)}
                    </Text>
                  </Box>
                </Inline>
              </Box>
          ))}
        </Box>
      </>
  );
};



const App = () => {
  const context = useProductContext();
  if (!context) {
    return "This is never displayed...";
  }

  return context.extension.entryPoint === "edit" ? <Edit /> : <View />;
};

ForgeReconciler.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
);
