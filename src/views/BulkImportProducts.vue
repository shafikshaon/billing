<template>
  <div class="row g-3">
    <div class="col-12">
      <h2 class="mb-3">Bulk Import Products</h2>
      <p class="text-muted">
        Import multiple products with inventory tracking from a CSV file
      </p>
    </div>

    <div class="col-lg-8">
        <!-- Download Sample Card -->
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Step 1: Download Sample Template</h5>
          </div>
          <div class="card-body">
            <p>Choose the template that fits your needs:</p>
            <div class="d-flex gap-2 flex-wrap">
              <button @click="downloadSampleWithSKU" class="btn btn-success">
                <i class="bi bi-download"></i> Download Sample with SKUs
              </button>
              <button @click="downloadSampleNoSKU" class="btn btn-success">
                <i class="bi bi-download"></i> Download Sample without SKUs
              </button>
            </div>
            <div class="alert alert-info mt-3 mb-0">
              <small>
                <strong>With SKUs:</strong> Best for physical goods with stock keeping units<br>
                <strong>Without SKUs:</strong> Best for services, consulting, or products without formal SKUs
              </small>
            </div>
          </div>
        </div>

        <!-- Upload Card -->
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Step 2: Upload Your CSV File</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="fileInput" class="form-label">Select CSV File</label>
              <input
                id="fileInput"
                ref="fileInput"
                type="file"
                class="form-control"
                accept=".csv"
                @change="handleFileSelect"
              />
            </div>

            <button
              @click="processFile"
              :disabled="!selectedFile || isProcessing"
              class="btn btn-primary"
            >
              <span v-if="isProcessing">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Processing...
              </span>
              <span v-else>
                <i class="bi bi-upload"></i> Process File
              </span>
            </button>
          </div>
        </div>

        <!-- Errors Card -->
        <div v-if="errors.length > 0" class="card mb-4 border-danger">
          <div class="card-header bg-danger text-white">
            <h5 class="mb-0">Errors Found</h5>
          </div>
          <div class="card-body">
            <ul class="mb-0">
              <li v-for="(error, index) in errors" :key="index" class="text-danger">
                {{ error }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Success Card -->
        <div v-if="successCount > 0" class="card mb-4 border-success">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">Import Successful</h5>
          </div>
          <div class="card-body">
            <p class="mb-0">
              Successfully imported <strong>{{ successCount }}</strong> product(s).
            </p>
            <router-link to="/products" class="btn btn-primary mt-3">
              View Products
            </router-link>
          </div>
        </div>
      </div>

      <!-- Instructions Card -->
      <div class="col-lg-4">
        <div class="card">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">Instructions</h5>
          </div>
          <div class="card-body">
            <h6>CSV Format Requirements:</h6>
            <ul class="small">
              <li><strong>name</strong> (required): Product name</li>
              <li><strong>sku</strong>: Stock Keeping Unit (optional)</li>
              <li><strong>unit</strong>: pcs, ea, units, doz, pair, pack, box, carton, kg, g, lbs, oz, l, m, ft, sq.m, sq.ft, hrs, days, months</li>
              <li><strong>type</strong>: goods, service, digital, rental/lease, subscription, fee, license, consulting, other</li>
              <li><strong>price</strong> (required): Unit price</li>
              <li><strong>discountType</strong>: none, fixed, percent</li>
              <li><strong>discountValue</strong>: Discount amount</li>
              <li><strong>taxId</strong>: Leave empty or use existing tax ID</li>
              <li><strong>active</strong>: true or false</li>
              <li><strong>description</strong>: Product description</li>
            </ul>

            <h6 class="mt-3">Inventory Tracking:</h6>
            <ul class="small">
              <li><strong>trackInventory</strong>: true or false</li>
              <li><strong>currentStock</strong>: Current stock quantity</li>
              <li><strong>reorderLevel</strong>: Minimum stock before reorder alert</li>
              <li><strong>reorderQuantity</strong>: Quantity to reorder when low</li>
            </ul>

            <div class="alert alert-warning mt-3 mb-0">
              <small>
                <strong>Note:</strong> Services typically don't need inventory tracking. Set trackInventory to false for services.
              </small>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '@/store'
import {
  downloadCSV,
  parseCSV,
  generateProductSampleCSV,
  generateProductSampleCSVNoSKU,
  parseProductData
} from '@/utils/bulkImport'

export default {
  name: 'BulkImportProducts',
  setup() {
    const router = useRouter()
    const fileInput = ref(null)
    const selectedFile = ref(null)
    const isProcessing = ref(false)
    const errors = ref([])
    const successCount = ref(0)

    const downloadSampleWithSKU = () => {
      const csv = generateProductSampleCSV()
      downloadCSV('products_sample_with_sku.csv', csv)
    }

    const downloadSampleNoSKU = () => {
      const csv = generateProductSampleCSVNoSKU()
      downloadCSV('products_sample_no_sku.csv', csv)
    }

    const handleFileSelect = (event) => {
      selectedFile.value = event.target.files[0]
      errors.value = []
      successCount.value = 0
    }

    const processFile = async () => {
      if (!selectedFile.value) return

      isProcessing.value = true
      errors.value = []
      successCount.value = 0

      try {
        const result = await parseCSV(selectedFile.value)

        if (result.errors && result.errors.length > 0) {
          errors.value = result.errors.map(err => `Parse error: ${err.message}`)
          isProcessing.value = false
          return
        }

        const { products, errors: validationErrors } = parseProductData(result.data)

        if (validationErrors.length > 0) {
          errors.value = validationErrors
          isProcessing.value = false
          return
        }

        // Add products to store
        products.forEach(product => {
          store.products.push(product)
        })

        successCount.value = products.length

        // Reset file input
        if (fileInput.value) {
          fileInput.value.value = ''
        }
        selectedFile.value = null
      } catch (error) {
        errors.value = [`Error processing file: ${error.message}`]
      } finally {
        isProcessing.value = false
      }
    }

    return {
      fileInput,
      selectedFile,
      isProcessing,
      errors,
      successCount,
      downloadSampleWithSKU,
      downloadSampleNoSKU,
      handleFileSelect,
      processFile
    }
  }
}
</script>
