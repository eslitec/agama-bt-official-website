import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { i18n } from '@/i18n'
import AppPager from '@/components/common/AppPager.vue'
import SearchField from '@/components/common/SearchField.vue'
import NewsList from '@/components/common/NewsList.vue'
import MIcon from '@/components/common/MIcon.vue'
import FileLink from '@/components/common/FileLink.vue'
import PageHeading from '@/components/common/PageHeading.vue'
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

afterEach(() => {
  i18n.global.locale.value = 'zh-TW'
})

describe('NewsList', () => {
  const makeRouter = () =>
    createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/news/:id', name: 'newsDetail', component: { template: '<div />' } },
      ],
    })

  it('每則連到消息內容頁', async () => {
    const w = mount(NewsList, {
      props: { items: newsData.slice(0, 3), variant: 'boxed' },
      global: { plugins: [makeRouter(), i18n] },
    })
    const links = w.findAll('a')
    expect(links).toHaveLength(3)
    expect(links[0]!.attributes('href')).toBe('/news/714')
    expect(w.find('time').attributes('datetime')).toBe('2026-06-22')
  })

  it('英文介面有英文標題時顯示英文並標示 lang，沒有時顯示中文', async () => {
    const { titleEn: _unused, ...second } = newsData[1]!
    void _unused
    const items = [{ ...newsData[0]!, titleEn: 'Subsidy list announced' }, second]
    const w = mount(NewsList, {
      props: { items },
      global: { plugins: [makeRouter(), i18n] },
    })
    const titles = () => w.findAll('.news-list__title')
    expect(titles()[0]!.text()).toBe(newsData[0]!.title)
    expect(titles()[0]!.attributes('lang')).toBe('zh-Hant-TW')
    i18n.global.locale.value = 'en'
    await nextTick()
    expect(titles()[0]!.text()).toBe('Subsidy list announced')
    expect(titles()[0]!.attributes('lang')).toBe('en')
    expect(titles()[1]!.text()).toBe(newsData[1]!.title)
    expect(titles()[1]!.attributes('lang')).toBe('zh-Hant-TW')
  })
})

describe('FileLink', () => {
  it('英文介面顯示英文檔名（含 aria-label），沒有英文時顯示中文', async () => {
    const props = { name: '申請書', nameEn: 'Application form', href: 'https://a.tw', ext: 'PDF' }
    const w = mount(FileLink, { props, global })
    expect(w.find('.file-link__name').text()).toBe('申請書')
    expect(w.attributes('aria-label')).toContain('申請書')
    i18n.global.locale.value = 'en'
    await nextTick()
    expect(w.find('.file-link__name').text()).toBe('Application form')
    expect(w.find('.file-link__name').attributes('lang')).toBe('en')
    expect(w.attributes('aria-label')).toContain('Application form')
    await w.setProps({ nameEn: undefined })
    expect(w.find('.file-link__name').text()).toBe('申請書')
    expect(w.find('.file-link__name').attributes('lang')).toBe('zh-Hant-TW')
  })
})

describe('PageHeading', () => {
  it('導言語系預設同標題，可用 leadLang 分開設定', async () => {
    const w = mount(PageHeading, {
      props: { eyebrow: 'E', title: 'Organic Crops', lead: '有機田區', contentLang: 'en' },
    })
    expect(w.find('h1').attributes('lang')).toBe('en')
    expect(w.find('p').attributes('lang')).toBe('en')
    await w.setProps({ leadLang: 'zh-Hant-TW' })
    expect(w.find('p').attributes('lang')).toBe('zh-Hant-TW')
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
