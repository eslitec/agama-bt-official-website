/**
 * Material Symbols Rounded（weight 400、FILL 1，與設計稿一致）SVG 圖示，只打包實際用到的圖示。
 * 新增圖示：從 @material-symbols/svg-400/rounded 匯入並加入 icons 物件。
 */
import add from '@material-symbols/svg-400/rounded/add-fill.svg?raw'
import agriculture from '@material-symbols/svg-400/rounded/agriculture-fill.svg?raw'
import check from '@material-symbols/svg-400/rounded/check-fill.svg?raw'
import close from '@material-symbols/svg-400/rounded/close-fill.svg?raw'
import deleteIcon from '@material-symbols/svg-400/rounded/delete-fill.svg?raw'
import description from '@material-symbols/svg-400/rounded/description-fill.svg?raw'
import eco from '@material-symbols/svg-400/rounded/eco-fill.svg?raw'
import edit from '@material-symbols/svg-400/rounded/edit-fill.svg?raw'
import factCheck from '@material-symbols/svg-400/rounded/fact_check-fill.svg?raw'
import factory from '@material-symbols/svg-400/rounded/factory-fill.svg?raw'
import inventory2 from '@material-symbols/svg-400/rounded/inventory_2-fill.svg?raw'
import link from '@material-symbols/svg-400/rounded/link-fill.svg?raw'
import menu from '@material-symbols/svg-400/rounded/menu-fill.svg?raw'
import pictureAsPdf from '@material-symbols/svg-400/rounded/picture_as_pdf-fill.svg?raw'
import searchOff from '@material-symbols/svg-400/rounded/search_off-fill.svg?raw'
import setMeal from '@material-symbols/svg-400/rounded/set_meal-fill.svg?raw'
import travelExplore from '@material-symbols/svg-400/rounded/travel_explore-fill.svg?raw'
import zoomIn from '@material-symbols/svg-400/rounded/zoom_in-fill.svg?raw'

const strip = (svg: string): string =>
  svg.replace(/\s(width|height)="\d+"/g, '').replace('<svg ', '<svg fill="currentColor" ')

const raw = {
  add,
  agriculture,
  check,
  close,
  delete: deleteIcon,
  description,
  eco,
  edit,
  fact_check: factCheck,
  factory,
  inventory_2: inventory2,
  link,
  menu,
  picture_as_pdf: pictureAsPdf,
  search_off: searchOff,
  set_meal: setMeal,
  travel_explore: travelExplore,
  zoom_in: zoomIn,
}

export type IconName = keyof typeof raw

export const icons: Record<string, string> = Object.fromEntries(
  Object.entries(raw).map(([k, v]) => [k, strip(v)]),
)
