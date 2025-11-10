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

    <div v-if="showPreview" class="preview">
      <h6 class="preview-title">Preview:</h6>
      <div class="preview-content" v-html="renderedHtml"></div>
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
.markdown-editor {
  width: 100%;
}

.toolbar {
  margin-bottom: 0.75rem;
}

.markdown-editor textarea {
  font-size: 0.9375rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.toolbar button {
  min-width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.preview {
  margin-top: 1rem;
  padding: 1.25rem;
  background: var(--gray-50);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.preview-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.75rem;
}

.preview-content {
  color: var(--text-primary);
  line-height: 1.6;
}
</style>
