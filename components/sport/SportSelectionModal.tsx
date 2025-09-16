'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { SportType } from '@/types'
import { useSport } from '@/contexts/SportContext'
import Image from 'next/image'

// Helper function to get sport icon
const getSportIcon = (sportType: SportType) => {
  switch (sportType) {
    case 'CFB':
      return '/ncaaf.svg'
    case 'NFL':
      return '/nfl.svg'
    default:
      return null
  }
}

interface SportSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectSport: (sport: SportType) => void
}

export function SportSelectionModal({ 
  isOpen, 
  onClose, 
  onSelectSport 
}: SportSelectionModalProps) {
  const { availableSports, currentSport } = useSport()

  const handleSportSelect = (sport: SportType) => {
    onSelectSport(sport)
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Select Sport
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-3">
                  {availableSports.map((sport) => (
                    <button
                      key={sport.id}
                      onClick={() => handleSportSelect(sport.shortName as SportType)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                        currentSport === sport.shortName
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-left">
                        <div className="flex items-center gap-x-4">
                          {getSportIcon(sport.id.toUpperCase() as SportType) && (
                            <Image
                              src={getSportIcon(sport.id.toUpperCase() as SportType)!}
                              alt={`${sport.displayName} icon`}
                              width={32}
                              height={32}
                              className="flex-shrink-0"
                            />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {sport.displayName}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {sport.shortName}
                            </p>
                          </div>
                        </div>
                        {currentSport === sport.shortName && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You can change this anytime in settings
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
