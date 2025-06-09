import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  history: []
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    addSearch: (state, action) => {
      state.history.push(action.payload)
      state.latest = action.payload
    },
    clearHistory: state => {
      state.history = []
      state.latest = null
    }
  }
})

export const { addSearch, clearHistory } = searchSlice.actions
export default searchSlice.reducer
