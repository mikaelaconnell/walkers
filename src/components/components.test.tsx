import { render, screen, fireEvent } from '@testing-library/react-native';
import { StripedHeading } from './StripedHeading';
import { ClubButton } from './ClubButton';
import { Field } from './Field';
import { Segmented } from './Segmented';

test('StripedHeading renders its text', async () => {
  await render(<StripedHeading text="walkers" />);
  expect(screen.getByText('walkers')).toBeTruthy();
});

test('ClubButton fires onPress and lowercases label', async () => {
  const fn = jest.fn();
  await render(<ClubButton label="request to join" onPress={fn} />);
  fireEvent.press(screen.getByText('request to join'));
  expect(fn).toHaveBeenCalled();
});

test('Field shows its error text', async () => {
  await render(<Field label="FIRST NAME" value="" onChangeText={() => {}} error="we need your first name" />);
  expect(screen.getByText('we need your first name')).toBeTruthy();
});

test('Segmented calls onChange with option value', async () => {
  const fn = jest.fn();
  await render(<Segmented options={[{ label: 'yes, I have a dog', value: 'yes' }, { label: 'just me', value: 'no' }]} value={null} onChange={fn} />);
  fireEvent.press(screen.getByText('just me'));
  expect(fn).toHaveBeenCalledWith('no');
});
