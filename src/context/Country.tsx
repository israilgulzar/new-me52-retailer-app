import { createContext, useContext, useEffect, useState } from "react";
import { Country } from 'country-state-city';

interface CountryContextI {
    country: Array<{ label: string, value: string }>
}

const CountryContext = createContext<CountryContextI>({
    country: []
})

const useCountry = () => useContext(CountryContext)

const CountryProvider = ({ children }: any) => {

    const [country, setCountry] = useState<Array<{ label: string, value: string }>>([{
        label: "India",
        value: "IN"
    }])

    useEffect(() => {
        const allCountries = Country.getAllCountries().map((c) => ({
            label: `${c.name}`,
            value: c.isoCode
        }));
        setCountry(allCountries);
    }, [])

    return (
        <CountryContext.Provider value={{ country }}>
            {children}
        </CountryContext.Provider>
    )
}

export { useCountry }
export default CountryProvider