# frozen_string_literal: true

require 'rspec'

load 'app/example.rb'

RSpec.describe 'rspec-daemon example' do
  describe 'sum' do
    subject { sum(x, y) }

    context 'When Integer given' do
      let(:x) { 1 }
      let(:y) { 2 }

      it { is_expected.to eq 3 }
    end

    context 'When String given' do
      let(:x) { 'Hello ' }
      let(:y) { 'World' }

      it { is_expected.to eq 'Hello World' }
    end
  end
end
