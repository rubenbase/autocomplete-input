import type { NextPage } from 'next'
import { useCallback, useState } from 'react'
import Image from 'next/image'
import AutoComplete from '../components/auto-complete'
import { Suggestion } from '../types/suggestion'

const Home: NextPage = () => {
  const [isLocationOptionsOpen, setIsLocationOptionsOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)

  // useCallback to avoid rerenders of child functions using onOpen/onClose. Small perf. boost.
  const openLocationOptions = useCallback(() => setIsLocationOptionsOpen(true), [])
  const closeLocationOptions = useCallback(() => setIsLocationOptionsOpen(false), [])

  // itemToString allows you to map an object coming from the API to a string
  // to show in the autocomplete suggestions
  const itemToString = (i: Suggestion) => (i ? i.name : '')

  return (
    <div className="p-4 flex flex-col max-w-xs m-auto">
      {/* Logo */}
      <header className="w-24 mb-6">
        <Image
          src="https://www.letsdeel.com/hubfs/deel-blue.svg"
          alt="deel-blue"
          width={69}
          height={24}
        />
      </header>

      <main>
        {/* Selected item */}
        <div className="mb-6 flex flex-col">
          <span className="font-bold">Selected item:</span>
          {/* Just setting a height to avoid screen shift */}
          <span className="h-6">{selectedLocation}</span>
        </div>

        {/* Autocomplete with internal fetching capacities */}
        <div className="flex justify-between mb-1">
          <label htmlFor="location" className="block text-sm font-medium">
            Location
          </label>
        </div>
        <div>
          <AutoComplete<Suggestion>
            id="locations"
            placeholder="Earth"
            show={isLocationOptionsOpen}
            onOpen={openLocationOptions}
            onClose={closeLocationOptions}
            queryEndpoint="https://rickandmortyapi.com/api/location"
            queryFilter="/?name="
            itemToString={itemToString}
            onSelect={(selected) => {
              setSelectedLocation(selected)
            }}
          />
        </div>
      </main>
    </div>
  )
}

export default Home
