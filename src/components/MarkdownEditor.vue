<template>
  <div class="markdown-editor">
    <div class="toolbar mb-2">
      <div class="btn-group btn-group-sm" role="group">
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="insertFormat('**', '**')"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="insertFormat('*', '*')"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="insertFormat('`', '`')"
          title="Code"
        >
          <code>&lt;/&gt;</code>
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="insertHeading"
          title="Heading"
        >
          H
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="insertList"
          title="Bullet List"
        >
          •••
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="insertLink"
          title="Link"
        >
          🔗
        </button>
      </div>
    </div>

    <textarea
      ref="textarea"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :rows="rows"
      class="form-control font-monospace"
    ></textarea>

    <div v-if="showPreview" class="preview mt-2 p-3 border rounded bg-light">
      <h6 class="text-muted mb-2">Preview:</h6>
      <div v-html="renderedHtml"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { marked } from 'marked'

export default {
  name: 'MarkdownEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Enter markdown text...'
    },
    rows: {
      type: Number,
      default: 8
    },
    showPreview: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props) {
    const textarea = ref(null)

    const renderedHtml = computed(() => {
      if (!props.modelValue) return ''
      return marked(props.modelValue)
    })

    const insertFormat = (before, after) => {
      const el = textarea.value
      const start = el.selectionStart
      const end = el.selectionEnd
      const text = el.value
      const selectedText = text.substring(start, end)

      const newText = text.substring(0, start) + before + selectedText + after + text.substring(end)
      el.value = newText
      el.dispatchEvent(new Event('input'))

      // Set cursor position
      const newCursorPos = start + before.length + selectedText.length
      el.setSelectionRange(newCursorPos, newCursorPos)
      el.focus()
    }

    const insertHeading = () => {
      const el = textarea.value
      const start = el.selectionStart
      const text = el.value
      const lineStart = text.lastIndexOf('\n', start - 1) + 1

      const newText = text.substring(0, lineStart) + '## ' + text.substring(lineStart)
      el.value = newText
      el.dispatchEvent(new Event('input'))

      el.setSelectionRange(lineStart + 3, lineStart + 3)
      el.focus()
    }

    const insertList = () => {
      const el = textarea.value
      const start = el.selectionStart
      const text = el.value
      const lineStart = text.lastIndexOf('\n', start - 1) + 1

      const newText = text.substring(0, lineStart) + '- ' + text.substring(lineStart)
      el.value = newText
      el.dispatchEvent(new Event('input'))

      el.setSelectionRange(lineStart + 2, lineStart + 2)
      el.focus()
    }

    const insertLink = () => {
      insertFormat('[', '](url)')
    }

    return {
      textarea,
      renderedHtml,
      insertFormat,
      insertHeading,
      insertList,
      insertLink
    }
  }
}
</script>

<style scoped>
.markdown-editor textarea {
  font-size: 0.95rem;
}

.toolbar button {
  min-width: 35px;
}

.preview {
  max-height: 400px;
  overflow-y: auto;
}
</style>
