import React, { useRef, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { useSelector, useDispatch } from 'react-redux'
import { clearHistory } from '../redux/searchSlice'
import SearchInput from '../components/SearchInput'

const MainScreen = () => {
  const dispatch = useDispatch()
  const mapRef = useRef(null)
  const searchInputRef = useRef(null)
  const searches = useSelector(state => state.search.history)
  const latest = useSelector(state => state.search.latest)

  const [zoom, setZoom] = useState(0.05) // initial zoom

  const handleZoom = zoomChange => {
    if (!mapRef.current) return

    mapRef.current
      .getCamera()
      .then(cam => {
        if (Platform.OS === 'ios') {
          const newDelta = zoom * (zoomChange > 0 ? 0.5 : 2) // smaller = zoom in
          setZoom(newDelta)

          mapRef.current.animateToRegion({
            latitude: cam.center.latitude,
            longitude: cam.center.longitude,
            latitudeDelta: newDelta,
            longitudeDelta: newDelta
          })
        } else {
          mapRef.current.animateCamera({
            ...cam,
            zoom: cam.zoom + zoomChange
          })
        }
      })
      .catch(() => {
        mapRef.current.animateToRegion({
          latitude: defaultRegion.latitude,
          longitude: defaultRegion.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        })
      })
  }

  const handleZoomIn = () => handleZoom(1)
  const handleZoomOut = () => handleZoom(-1)

  useEffect(() => {
    if (latest && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: latest.lat,
          longitude: latest.lng,
          latitudeDelta: zoom,
          longitudeDelta: zoom
        },
        1000
      )
    }
  }, [latest, zoom])

  const handleClear = () => {
    dispatch(clearHistory())
    if (searchInputRef.current) {
      searchInputRef.current.clearInput()
    }
  }

  const defaultRegion = {
    latitude: 3.139,
    longitude: 101.6869,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={defaultRegion}
        zoomEnabled={true}
        scrollEnabled={true}
        showsUserLocation={true}
        onMapReady={() => {
          mapRef.current?.animateCamera({
            center: {
              latitude: defaultRegion.latitude,
              longitude: defaultRegion.longitude
            },
            zoom: 12
          })
        }}
      >
        {latest && (
          <Marker
            coordinate={{ latitude: latest.lat, longitude: latest.lng }}
            title={latest.description}
          />
        )}
      </MapView>

      {/* Search bar over map */}
      <SearchInput ref={searchInputRef} />

      {/* Zoom controls over map */}
      <View style={styles.zoomControls}>
        <TouchableOpacity onPress={handleZoomIn} style={styles.zoomBtn}>
          <Text style={styles.zoomText}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleZoomOut} style={styles.zoomBtn}>
          <Text style={styles.zoomText}>－</Text>
        </TouchableOpacity>
      </View>

      {/* History list and clear button (optional: only show when has data) */}
      {searches.length > 0 && (
        <>
          <FlatList
            style={styles.historyList}
            data={searches}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <Text style={styles.historyItem}>{item.description}</Text>
            )}
          />
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearText}>Clear History</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  historyItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc'
  },
  clearBtn: {
    backgroundColor: 'tomato',
    padding: 10,
    alignItems: 'center'
  },
  clearText: {
    color: 'white',
    fontWeight: 'bold'
  },
  zoomControls: {
    position: 'absolute',
    right: 10,
    top: 150,
    zIndex: 10,
    gap: 10
  },
  zoomBtn: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 25,
    elevation: 5,
    alignItems: 'center'
  },
  zoomText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 20
  },
  historyList: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    backgroundColor: 'white',
    maxHeight: 120
  },

  clearBtn: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: 'tomato',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20
  },

  clearText: {
    color: 'white',
    fontWeight: 'bold'
  }
})

export default MainScreen
