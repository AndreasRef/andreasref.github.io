const LABELS = {
  en: { zoom: 'Webcam zoom', preview: 'Webcam preview', confirm: 'Confirm', confirmed: 'Confirmed' },
  da: { zoom: 'Webcam-zoom', preview: 'Webcam-preview', confirm: 'Bekræft', confirmed: 'Bekræftet' },
};

export class CameraSetup {
  constructor(camera, onChange) {
    this.camera = camera;
    this.draftZoom = camera.zoom;
    this.confirmed = false;
    this.element = document.createElement('div');
    this.element.id = 'camera-setup';
    this.element.innerHTML = `
      <canvas id="camera-preview" width="640" height="360" role="img"></canvas>
      <div class="camera-zoom-label">
        <label for="camera-zoom"></label>
        <output for="camera-zoom" id="camera-zoom-value">1.00×</output>
      </div>
      <div class="camera-zoom-controls">
        <input id="camera-zoom" type="range" min="1" max="3" step="0.05" value="1">
        <button id="btn-confirm-camera" type="button"></button>
      </div>
    `;
    this.preview = this.element.querySelector('canvas');
    this.ctx = this.preview.getContext('2d');
    this.slider = this.element.querySelector('input');
    this.confirmButton = this.element.querySelector('button');
    this.value = this.element.querySelector('output');

    this.slider.addEventListener('input', () => {
      this.draftZoom = Number(this.slider.value);
      this.confirmed = false;
      this.value.textContent = `${this.draftZoom.toFixed(2)}×`;
      this.setLanguage(this.language);
      onChange();
    });
    this.confirmButton.addEventListener('click', () => {
      this.camera.setZoom(this.draftZoom);
      this.confirmed = true;
      this.setLanguage(this.language);
      onChange();
    });
    this.setLanguage('en');
  }

  setLanguage(language) {
    this.language = language === 'da' ? 'da' : 'en';
    const labels = LABELS[this.language];
    this.element.querySelector('label').textContent = labels.zoom;
    this.preview.setAttribute('aria-label', labels.preview);
    this.slider.setAttribute('aria-valuetext', `${this.draftZoom.toFixed(2)}×`);
    this.confirmButton.textContent = this.confirmed ? labels.confirmed : labels.confirm;
    this.confirmButton.disabled = this.confirmed;
  }

  renderPreview() {
    const { video } = this.camera;
    if (!video.videoWidth || !video.videoHeight) return;
    const height = Math.round(this.preview.width * video.videoHeight / video.videoWidth);
    if (this.preview.height !== height) this.preview.height = height;
    this.ctx.save();
    this.ctx.translate(this.preview.width, 0);
    this.ctx.scale(-1, 1);
    this.camera.drawCrop(this.ctx, this.draftZoom);
    this.ctx.restore();
  }
}
