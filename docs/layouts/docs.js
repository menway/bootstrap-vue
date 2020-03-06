import Ad from '~/components/ad'
import DocBreadcrumbs from '~/components/doc-breadcrumbs.vue'
import Feedback from '~/components/feedback'
import Footer from '~/components/footer'
import Header from '~/components/header'
import QuickLinks from '~/components/quick-links.vue'
import Search from '~/components/search'
import Sidebar from '~/components/sidebar.vue'
import Toc from '~/components/toc.vue'

export default {
  name: 'BVDDocsLayout',
  data() {
    return {
      hasToc: false,
      contentElements: ['quick-links', 'ad'],
      contentElementsVisible: false
    }
  },
  computed: {
    currentPath() {
      return this.$route.path
    }
  },
  created() {
    // Only needed so we can set/clear aria-hidden on the TOC nav wrapper
    this.$root.$on('docs-set-toc', toc => {
      this.hasToc = Boolean(toc && toc.toc)

      this.$nextTick(() => {
        this.positionContentElements()
      })
    })
  },
  mounted() {
    this.$nextTick(() => {
      this.positionContentElements()
    })
  },
  methods: {
    positionContentElements() {
      // Move the elements to the correct position, if possible
      const $body = document.body
      const $referenceNode = $body.querySelector('.bd-lead') || $body.querySelector('h1')
      if ($referenceNode) {
        // Get the content elements by their ref names
        const $contentElements = this.contentElements.map(name => {
          const $node = this.$refs[name]
          return $node.$el || $node
        })
        // We add the elements in reverse order after the `$referenceNode`
        // to ensure the correct order
        $contentElements.reverse().forEach($contentElement => {
          // IE 11 doesn't support the `node.after()` method, and appears
          // that the polyfill doesn't polyfill this method
          $referenceNode.insertAdjacentElement('afterend', $contentElement)
        })

        // Show the content elements
        this.contentElementsVisible = true
      }
    }
  },
  render(h) {
    const $sidebarCol = h(
      'b-col',
      {
        staticClass: 'bd-sidebar border-bottom-0',
        props: { cols: 12, md: 3, xl: 2 }
      },
      [h(Search), h(Sidebar)]
    )
    const $contentCol = h(
      'b-col',
      {
        staticClass: 'bd-content',
        class: ['pb-md-3', 'pl-md-5'],
        props: { cols: 12, md: 9, xl: 8 }
      },
      [
        h(DocBreadcrumbs, { class: ['float-left', 'mt-2', 'mb-0', 'mb-lg-2'] }),
        h(Feedback, { class: ['float-right', 'mt-2', 'mb-0', 'mb-lg-2'] }),
        h('div', { class: ['clearfix', 'd-block'] }),
        h(QuickLinks, {
          class: 'd-xl-none',
          directives: [{ name: 'show', value: this.contentElementsVisible }],
          ref: 'quick-links'
        }),
        h(Ad, {
          directives: [{ name: 'show', value: this.contentElementsVisible }],
          // We apply the route path as key to change the ad on every page
          key: this.currentPath,
          ref: 'ad'
        }),
        h('nuxt')
      ]
    )
    const $tocCol = h(
      'b-col',
      {
        staticClass: 'bd-toc',
        class: ['d-none', 'd-xl-block'],
        props: { tag: 'nav', xl: 2 },
        attrs: {
          'aria-label': 'Secondary navigation',
          'aria-hidden': this.hasToc ? null : 'true'
        }
      },
      [h(Toc)]
    )
    const $row = h('b-row', { class: ['flex-xl-nowrap2'] }, [$sidebarCol, $contentCol, $tocCol])
    const $container = h('b-container', { props: { fluid: true } }, [$row])
    return h('div', {}, [h(Header), $container, h(Footer, { props: { isDocs: true } })])
  }
}
