<template>
  <div class="row g-3">
    <div class="col-12">
      <h2 class="mb-3">Bulk Import Customers</h2>
      <p class="text-muted">
        Import multiple customers with their contacts and addresses from a CSV file
      </p>
    </div>

    <div class="col-lg-8">
        <!-- Download Sample Card -->
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Step 1: Download Sample Template</h5>
          </div>
          <div class="card-body">
            <p>Download the sample CSV file with example data to see the correct format.</p>
            <button @click="downloadSample" class="btn btn-success">
              <i class="bi bi-download"></i> Download Sample CSV
            </button>
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
              Successfully imported <strong>{{ successCount }}</strong> customer(s).
            </p>
            <router-link to="/customers" class="btn btn-primary mt-3">
              View Customers
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
              <li><strong>name</strong> (required): Customer name</li>
              <li><strong>type</strong> (required): 'company' or 'person'</li>
              <li><strong>email</strong>: Contact email</li>
              <li><strong>phone</strong>: Contact phone</li>
              <li><strong>taxId</strong>: Tax ID or TIN (for companies)</li>
              <li><strong>nid</strong>: National ID (for individuals)</li>
              <li><strong>website</strong>: Website URL</li>
            </ul>

            <h6 class="mt-3">Addresses (up to 2):</h6>
            <ul class="small">
              <li><strong>address1_type</strong>: primary, billing, shipping, warehouse, secondary</li>
              <li><strong>address1_line1</strong>: Address line 1</li>
              <li><strong>address1_line2</strong>: Address line 2</li>
              <li><strong>address1_city</strong>: City</li>
              <li><strong>address1_zip</strong>: ZIP/Postal code</li>
              <li>Same pattern for address2_*</li>
            </ul>

            <h6 class="mt-3">Contacts (up to 2):</h6>
            <ul class="small">
              <li><strong>contact1_type</strong>: primary, billing, support, secondary</li>
              <li><strong>contact1_name</strong>: Contact name</li>
              <li><strong>contact1_email</strong>: Contact email</li>
              <li><strong>contact1_phone</strong>: Contact phone</li>
              <li>Same pattern for contact2_*</li>
            </ul>
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
  generateCustomerSampleCSV,
  parseCustomerData
} from '@/utils/bulkImport'

export default {
  name: 'BulkImportCustomers',
  setup() {
    const router = useRouter()
    const fileInput = ref(null)
    const selectedFile = ref(null)
    const isProcessing = ref(false)
    const errors = ref([])
    const successCount = ref(0)

    const downloadSample = () => {
      const csv = generateCustomerSampleCSV()
      downloadCSV('customers_sample.csv', csv)
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

        const { customers, errors: validationErrors } = parseCustomerData(result.data)

        if (validationErrors.length > 0) {
          errors.value = validationErrors
          isProcessing.value = false
          return
        }

        // Add customers to store
        customers.forEach(customer => {
          store.customers.push(customer)
        })

        successCount.value = customers.length

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
      downloadSample,
      handleFileSelect,
      processFile
    }
  }
}
</script>
