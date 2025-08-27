'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useSport } from '@/contexts/SportContext'
import { SportType } from '@/types'

export function SportSelector() {
  const { currentSport, currentSportData, availableSports, changeSport } = useSport()

  const handleSportChange = (sport: SportType) => {
    changeSport(sport)
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
          <span className="flex items-center">
            <span className="hidden sm:inline">{currentSportData.displayName}</span>
            <span className="sm:hidden">{currentSportData.shortName}</span>
          </span>
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {availableSports.map((sport) => (
              <Menu.Item key={sport.id}>
                {({ active }) => (
                  <button
                    onClick={() => handleSportChange(sport.shortName as SportType)}
                    className={`${
                      active 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                        : 'text-gray-700 dark:text-gray-300'
                    } ${
                      currentSport === sport.shortName 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium' 
                        : ''
                    } group flex w-full items-center px-4 py-2 text-sm`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-medium">{sport.displayName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{sport.shortName}</div>
                      </div>
                      {currentSport === sport.shortName && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
