module.exports = {
  theme: {
    fontFamily: {
      sans: 'Roboto, sans-serif',
      serif: 'Libre Baskerville, serif'
    },
    extend: {
      colors: {
        lightGrey: '#F7F0ED',
        lightOrange: '#FF9C66',
        orange: '#FF5933',
        blue: '#171AA8',
        purple: '#7854F2',
      },
      gridTemplateColumns: {
        'similar-fractions': '2fr 1.2fr 1fr',
        'two-thirds': '2fr 1fr',
        'tho-thirds-inverse': '1fr 2fr',
        'three-to-one': '3fr 1fr',
        'similar-reverse': '1fr 1.2fr',
        'three-indent-half': '0.5fr 2fr 2fr 2fr'
      },
      fontSize: {
        big: '2rem',
        large: '3rem',
        xxl: '5rem'
      }
    }
  }
}