import { h, Component } from 'preact';

const validate = ({ alt }) => (alt ? [] : ['Alt tag must be set']);

class ImageEmbed extends Component {
  componentDidMount() {
    this.props.updateState({}, validate(this.props.fields));
  }

  update(fields = {}) {
    this.props.updateState(
      fields,
      validate({
        ...this.props.fields,
        ...fields
      })
    );
  }

  render({ fields: { caption, src, alt }, editSrc }) {
    return (
      <div>
        <img style={{ width: '250px', height: 'auto' }} src={src} alt={alt} />
        <label>
          Caption
          <input
            type="text"
            value={caption}
            onInput={e => this.update({ caption: e.target.value })}
          />
        </label>
        <label>
          Alt
          <input
            type="text"
            value={alt}
            onInput={e => this.update({ alt: e.target.value })}
          />
        </label>
        {editSrc && (
          <label>
            Src
            <input
              type="text"
              value={src}
              onInput={e => this.update({ src: e.target.value })}
            />
          </label>
        )}
      </div>
    );
  }
}

export default ImageEmbed;
