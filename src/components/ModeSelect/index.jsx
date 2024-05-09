import {
  useColorScheme
} from '@mui/material/styles'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkMode'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import Box from '@mui/material/Box'

function ModeSelect() {
  const { mode, setMode } = useColorScheme()
  const handleChange = (event) => {
    const selectedMode = event.target.value
    setMode(selectedMode)
  }
  return (
    <div>
      <FormControl sx={{ m: 1, minWidth: 80 }} size='small'>
        <InputLabel id="label-select-dark-light-mode">Mode</InputLabel>
        <Select
          labelId="label-select-dark-light-mode"
          id="select-dark-light-mode"
          value={mode}
          onChange={handleChange}
          autoWidth
          label="Mode"
        >
          <MenuItem value="light">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LightModeIcon fontSize="small"/>Light
            </div>
          </MenuItem>
          <MenuItem value="dark">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DarkModeOutlinedIcon fontSize="small"/>Dark
            </Box>
          </MenuItem>
          <MenuItem value="system">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SettingsBrightnessIcon fontSize="small"/>System
            </div>
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  )
}

export default ModeSelect
