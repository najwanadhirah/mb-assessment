import React, { useState, forwardRef, useImperativeHandle } from 'react'
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native'
import { useDispatch } from 'react-redux'
import { GOOGLE_API_KEY } from '@env'
import { addSearch } from '../redux/searchSlice'

const SearchInput = forwardRef((props, ref) => {
  const [input, setInput] = useState('')
  const [results, setResults] = useState([])
  const dispatch = useDispatch()

  const handleSearch = async query => {
    setInput(query)
    if (query.length < 3) return

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${GOOGLE_API_KEY}&components=country:my`
      )
      const data = await res.json()
      setResults(data.predictions)
    } catch (err) {
      console.error('Search error:', err)
    }
  }

  const handleSelect = async place => {
    try {
      const detailRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${GOOGLE_API_KEY}`
      )
      const detailData = await detailRes.json()
      const location = detailData.result.geometry.location

      dispatch(
        addSearch({
          description: place.description,
          lat: location.lat,
          lng: location.lng
        })
      )

      setInput(place.description)
      setResults([])
    } catch (err) {
      console.error('Place detail error:', err)
    }
  }

  useImperativeHandle(ref, () => ({
    clearInput: () => {
      setInput('')
      setResults([])
    }
  }))

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={handleSearch}
        placeholder='Search for a place'
      />
      <FlatList
        data={results}
        keyExtractor={item => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item)}>
            <Text style={styles.resultItem}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 40,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    zIndex: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3
  }
})

export default SearchInput
