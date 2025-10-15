import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff'
  },

  // Header
  header: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: 20,
    marginBottom: 20,
    marginLeft: -36,
    marginRight: -36,
    marginTop: -36
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 11
  },

  // Secciones de información
  infoSection: {
    marginBottom: 15
  },
  infoLabel: {
    fontSize: 9,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontWeight: 'bold'
  },
  infoValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000'
  },

  // Tabla
  table: {
    marginTop: 20
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    fontSize: 9,
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    fontSize: 9
  },
  tableRowEven: {
    backgroundColor: '#f9fafb'
  },

  // Columnas de la tabla
  colSKU: {
    width: '15%'
  },
  colNombre: {
    width: '40%'
  },
  colCantidad: {
    width: '15%',
    textAlign: 'right'
  },
  colPrecio: {
    width: '15%',
    textAlign: 'right'
  },
  colSubtotal: {
    width: '15%',
    textAlign: 'right'
  },

  // Totales
  totalsContainer: {
    marginTop: 20,
    alignItems: 'flex-end'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 4,
    fontSize: 11
  },
  totalRowFinal: {
    borderTopWidth: 2,
    borderTopColor: '#2563eb',
    marginTop: 8,
    paddingTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb'
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 36,
    right: 36,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10
  }
});
