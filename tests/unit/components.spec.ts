import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { i18n } from '@/i18n'
import AppPager from '@/components/common/AppPager.vue'
import SearchField from '@/components/common/SearchField.vue'
import NewsList from '@/components/common/NewsList.vue'
import MIcon from '@/components/common/MIcon.vue'
import { newsData } from '@/api/data/news.data'

const global = { plugins: [i18n] }

describe('AppPager', () => {
  it('點頁碼更新 v-model，首頁時上一頁停用，頁數多時以省略號收合', async () => {
    const w = mount(AppPager, {
      props: {
        modelValue: 1,
        total: 11,
        'onUpdate:modelValue': (v: number) => w.setProps({ modelValue: v }),
      },
      global,
    })
    // 桌機寬度：上一頁、1 2 3、…、11、下一頁
    expect(w.findAll('.pager__num').map((b) => b.text())).toEqual(['1', '2', '3', '11'])
    expect(w.find('.pager__gap').exists()).toBe(true)
    expect(w.findAll('button')[0]!.attributes('disabled')).toBeDefined()
    await w.findAll('.pager__num')[2]!.trigger('click')
    expect(w.props('modelValue')).toBe(3)
    expect(w.find('[aria-current="page"]').text()).toBe('3')
    expect(w.findAll('.pager__num').map((b) => b.text())).toEqual(['1', '2', '3', '4', '5', '11'])
  })

  it('最後一頁時下一頁停用', () => {
    const w = mount(AppPager, { props: { modelValue: 11, total: 11 }, global })
    expect(w.findAll('button').at(-1)!.attributes('disabled')).toBeDefined()
  })
})

describe('SearchField', () => {
  it('雙向綁定且有無障礙標籤', async () => {
    const w = mount(SearchField, {
      props: {
        modelValue: '',
        label: '搜尋消息',
        placeholder: 'x',
        'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }),
      },
      global,
    })
    await w.find('input').setValue('補助')
    expect(w.props('modelValue')).toBe('補助')
    const id = w.find('input').attributes('id')
    expect(w.find(`label[for="${id}"]`).text()).toBe('搜尋消息')
    expect(w.find('button').exists()).toBe(false)
  })
})

describe('NewsList', () => {
  it('每則連到消息內容頁', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/news/:id', name: 'newsDetail', component: { template: '<div />' } },
      ],
    })
    const w = mount(NewsList, {
      props: { items: newsData.slice(0, 3), variant: 'boxed' },
      global: { plugins: [router] },
    })
    const links = w.findAll('a')
    expect(links).toHaveLength(3)
    expect(links[0]!.attributes('href')).toBe('/news/714')
    expect(w.find('time').attributes('datetime')).toBe('2026-06-22')
  })
})

describe('MIcon', () => {
  it('輸出 SVG 並對螢幕閱讀器隱藏', () => {
    const w = mount(MIcon, { props: { name: 'eco', size: 20 } })
    expect(w.attributes('aria-hidden')).toBe('true')
    expect(w.find('svg').exists()).toBe(true)
    expect(w.attributes('style')).toContain('font-size: 20px')
  })
})
