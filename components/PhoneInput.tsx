'use client'

import { useState } from 'react'
import PhoneInput, { getCountries, type Value } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

type Props = {
  defaultValue?: string | null
  name?: string
}

export default function PhoneField({
  defaultValue,
  name = 'telephone',
}: Props) {
  const [value, setValue] = useState<Value>(
    (defaultValue as Value | null) ?? ('' as Value),
  )
  const countries = getCountries().filter((c) => c !== 'IL')

  return (
    <div className="phone-field-wrapper">
      <PhoneInput
        international
        defaultCountry="FR"
        countries={countries}
        value={value}
        onChange={(v) => setValue(v ?? ('' as Value))}
      />
      <input type="hidden" name={name} value={value ?? ''} />
    </div>
  )
}

